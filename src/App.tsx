/* eslint-disable max-len */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useRef, useState } from 'react';
import { Header } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { TodoList } from './components/TodoList/TodoList';
import { Todo } from './types/Todo';
import { deleteTodo, getTodos, USER_ID } from './api/todos';
import { Errors } from './utils/Errors';
import { FilterTodosBy } from './utils/FilterTodosBy';
import { Error } from './components/Error/Error';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [hasError, setHasError] = useState(Errors.NoError);
  const [filterBy, setFilterBy] = useState(FilterTodosBy.All);
  const [title, setTitle] = useState('');
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingTodoId, setUpdatingTodoId] = useState<number | null>(null);
  const [toggleCompleteAll, setToggleCompleteAll] = useState(false);

  useEffect(() => {
    setHasError(Errors.NoError);

    (async () => {
      try {
        const response = await getTodos();

        setTodos(response);
      } catch {
        setHasError(Errors.UnableToLoad);
      }
    })();
  }, []);

  const filteredTodos = todos.filter(todo => {
    switch (filterBy) {
      case FilterTodosBy.Active:
        return !todo.completed;
      case FilterTodosBy.Completed:
        return todo.completed;
      default:
        return true;
    }
  });

  const uncompletedTodosLength = todos.filter(todo => !todo.completed).length;
  const completedTodosLenght = todos.filter(todo => todo.completed).length;

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleDeleteAllCompleted = async () => {
    const completedTodos = todos.filter(todo => todo.completed);

    for (const todo of completedTodos) {
      try {
        await deleteTodo(todo.id);
        setTodos(currTodos =>
          currTodos.filter(currTodo => currTodo.id !== todo.id),
        );
      } catch (error) {
        setHasError(Errors.UnableToDelete);
      }
    }
  };

  return (
    <div className="todoapp">
      <div className="todoapp__content">
        <h1 className="todoapp__title">todos</h1>
        <Header
          title={title}
          setTitle={setTitle}
          setHasError={setHasError}
          hasError={hasError}
          USER_ID={USER_ID}
          todos={todos}
          setTodos={setTodos}
          setTempTodo={setTempTodo}
          inputRef={inputRef}
          isUpdating={isUpdating}
          setIsUpdating={setIsUpdating}
          updatingTodoId={updatingTodoId}
          setUpdatingTodoId={setUpdatingTodoId}
          setToggleCompleteAll={setToggleCompleteAll}
        />
        <TodoList
          todos={filteredTodos}
          tempTodo={tempTodo}
          isDeleting={isDeleting}
          setIsDeleting={setIsDeleting}
          setTodos={setTodos}
          setHasError={setHasError}
          inputRef={inputRef}
          initialTodos={todos}
          isUpdating={isUpdating}
          setIsUpdating={setIsUpdating}
          updatingTodoId={updatingTodoId}
          setUpdatingTodoId={setUpdatingTodoId}
          toggleCompleteAll={toggleCompleteAll}
        />

        {todos.length > 0 && (
          <Footer
            uncompletedTodosLength={uncompletedTodosLength}
            filterBy={filterBy}
            setFilteredBy={setFilterBy}
            completedTodosLenght={completedTodosLenght}
            handleDeleteAllCompleted={handleDeleteAllCompleted}
          />
        )}
      </div>
      <Error hasError={hasError} setHasError={setHasError} />
    </div>
  );
};
