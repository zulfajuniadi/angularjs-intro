angular.module('todos', ['LocalStorageModule', 'firebase'])
    .factory('arraystorage', function() {
        var todos = [
            {
                done: false,
                title: 'Buy Milk'
            },
            {
                done: true,
                title: 'Buy Eggs'
            }
        ];
        var functions = {
            all: function() {
                return todos;
            },
            create: function(todo) {
                todos.push(todo);
            },
            remove: function(todo) {
                var index = todos.indexOf(todo);
                todos.splice(index, 1);
            },
            update: function(todo) {
                todo.title = todo.editingTitle;
            },
            clearDone: function() {
                todos = functions.getActiveTodos();
            },
            getActiveTodos: function() {
                return todos.filter(function(todo){
                    return !todo.done;
                });
            },
            getCompletedTodos: function() {
                return todos.filter(function(todo){
                    return !todo.done;
                });
            },
            getDoneTodos: function() {
                return todos.filter(function(todo){
                    return todo.done;
                });
            }
        };
        return functions;
    })
    .factory('localstorage', ['localStorageService', function(localStorageService) {
        var todos = localStorageService.get('todos') || [];
        var functions = {
            commit: function() {
                localStorageService.set('todos', todos);
            },
            all: function() {
                return todos;
            },
            create: function(todo) {
                todos.push(todo);
                this.commit();
            },
            remove: function(todo) {
                var index = todos.indexOf(todo);
                todos.splice(index, 1);
                this.commit();
            },
            update: function(todo) {
                todo.title = todo.editingTitle;
                this.commit();
            },
            clearDone: function() {
                todos = this.getActiveTodos();
                this.commit();
            },
            getActiveTodos: function() {
                return todos.filter(function(todo){
                    return !todo.done;
                });
            },
            getCompletedTodos: function() {
                return todos.filter(function(todo){
                    return !todo.done;
                });
            },
            getDoneTodos: function() {
                return todos.filter(function(todo){
                    return todo.done;
                });
            }
        };
        return functions;
    }])
    .factory('firebasestorage', ['$firebaseArray', function($firebaseArray) {
        var ref = new Firebase('https://magic-todos.firebaseio.com/todos');
        var todos = $firebaseArray(ref);
        var functions = {
            commit: function(todo) {
                todos.$save(todo);
            },
            all: function() {
                return todos;
            },
            create: function(todo) {
                todos.$add(todo);
            },
            remove: function(todo) {
                todos.$remove(todo);
            },
            update: function(todo) {
                todo.title = todo.editingTitle;
                todos.$save(todo);
            },
            clearDone: function() {
                todos.forEach(function(todo){
                    if(todo.done) {
                        todos.$remove(todo);
                    }
                });
            },
            getActiveTodos: function() {
                return todos.filter(function(todo){
                    return !todo.done;
                });
            },
            getCompletedTodos: function() {
                return todos.filter(function(todo){
                    return !todo.done;
                });
            },
            getDoneTodos: function() {
                return todos.filter(function(todo){
                    return todo.done;
                });
            }
        };
        return functions;
    }])
    .factory('storage', [
        'arraystorage', 
        'localstorage', 
        'firebasestorage', 
        function(
            arraystorage, 
            localstorage,
            firebasestorage
        ){
            return firebasestorage;
        }
    ])
    .controller('TodoController', [
        '$scope', 
        'storage', 
        '$window', 
        '$timeout', 
    function(
        $scope,
        storage,
        $window,
        $timeout
    ) {

        angular.extend($scope, {
            newTodoTitle : '',
            state : '',
            todosFilter : {},
            todos : [],
            loadTodos : function() {
                this.todos = storage.all();
            },
            handleKeystrokes : function(event, todo) {
                if(todo) {
                    switch (event.keyCode) {
                        case 13:
                            todo.editing = false;
                            todo.title = todo.editingTitle;
                            storage.update(todo);
                            break;
                        case 27:
                            todo.editing = false;
                            todo.editingTitle = todo.title;
                            break;
                    }
                } else {
                    switch (event.keyCode) {
                        case 13:
                            if(this.newTodoTitle) {
                                storage.create({title: this.newTodoTitle, done: false});
                            }
                        case 27:
                            this.newTodoTitle = '';
                            break;
                    }
                }
            },
            setEditing : function (todo) {
                todo.editingTitle = todo.title;
                todo.editing = true;
            },
            deleteTodo : function(todo) {
                storage.remove(todo);
            },
            getIncompleted : storage.getCompletedTodos,
            clearDone : function(){
                storage.clearDone();
                this.loadTodos();
            },
            commitTodo: function(todo) {
                storage.commit(todo);
            }
        });

        $window.onhashchange = function() {
            $scope.state = this.location.hash.substring(2);
            switch ($scope.state) {
                case 'completed' :
                    $scope.todosFilter = {done: true};
                    break;
                case 'active' :
                    $scope.todosFilter = {done: false};    
                    break;
                default:
                    $scope.todosFilter = {};
                    break;
            }
            $scope.$apply();
        };

        $scope.loadTodos();
        $timeout($window.onhashchange, 1);
    }])
