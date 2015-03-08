angular.module('todos', [])
    .factory('storage', function(){
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
                switch (event.keyCode) {
                    case 13:
                        if(!todo && this.newTodoTitle) {
                            storage.create({title: this.newTodoTitle, done: false});
                        } else if(todo) {
                            storage.update(todo);
                        }
                    case 27:
                        if(!todo) {
                            this.newTodoTitle = '';
                        } else if(todo) {
                            todo.editingTitle = '';
                            todo.editing = false;
                        }
                        break;
                }
            },
            setEditing : function (todo) {
                todo.editingTitle = todo.title;
                todo.editing = true;
            },
            deleteTodo : storage.remove,
            getIncompleted : storage.getCompletedTodos,
            clearDone : function(){
                storage.clearDone();
                this.loadTodos();
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
