import React, { useEffect, useRef, useState } from 'react';
import { Errors } from '../../utils/Errors';
import { addTodo, updateTodo } from '../../api/todos';
import { Todo } from '../../types/Todo';
import cn from 'classnames';

interface Props {
  title: string;
  setTitle: (title: string) => void;
  hasError: Errors;
  setHasError: (hasError: Errors) => void;
  USER_ID: number;
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  setTempTodo: (todo: Todo | null) => void;
  tempTodo: Todo | null;
  inputRef: React.RefObject<HTMLInputElement>;
  isDeleteAllCompleted: boolean;
  isUpdating: boolean;
  setIsUpdating: (isUpdating: boolean) => void;
  updatingTodoId: number | null;
  setUpdatingTodoId: (updatingTodoId: number | null) => void;
  setToggleCompleteAll: (toggleCompleteAll: boolean) => void;
}

export const Header: React.FC<Props> = props => {
  const {
    title,
    setTitle,
    setHasError,
    USER_ID,
    todos,
    setTodos,
    setTempTodo,
    tempTodo,
    inputRef,
    isDeleteAllCompleted,
    setIsUpdating,
    setUpdatingTodoId,
    setToggleCompleteAll,
  } = props;
  const [isDisabled, setIsDisabled] = useState(false);
  const [tempIdCounter, setTempIdCounter] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAllTodosCompleted = todos.every(todo => todo.completed);
  const isTodosNotEmpty = todos.length !== 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasError(Errors.NoError);

    if (!title.trim()) {
      setHasError(Errors.TitleEmpty);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setHasError(Errors.NoError);
      }, 3000);

      return;
    }

    const newTodo = {
      userId: USER_ID,
      title: title.trim(),
      completed: false,
    };

    setTempTodo({ ...newTodo, id: 0 });
    setIsDisabled(true);

    try {
      const addNewTodo = await addTodo(newTodo);

      setTodos([...todos, addNewTodo]);
      setIsDisabled(false);
      setTitle('');
      setTempTodo(null);
      setTempIdCounter(tempIdCounter + 1);

      inputRef.current?.focus();
    } catch {
      setHasError(Errors.UnableToAdd);
      setTempTodo(null);
      setIsDisabled(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setHasError(Errors.NoError);
      }, 3000);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [tempTodo, isDeleteAllCompleted]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleUpdateToCompleteAll = async () => {
    setIsUpdating(true);
    setUpdatingTodoId(null);
    setToggleCompleteAll(true);

    const areAllTodosCompleted = todos.every(todo => todo.completed);
    const todosToUpdate = todos.filter(
      todo => todo.completed === areAllTodosCompleted,
    );

    try {
      const updatePromises = todosToUpdate.map(todo =>
        updateTodo(todo.id, {
          title: todo.title,
          completed: !areAllTodosCompleted,
          userId: todo.userId,
        }),
      );

      await Promise.all(updatePromises);

      const updatedTodos = todos.map(todo => ({
        ...todo,
        completed: todosToUpdate.some(t => t.id === todo.id)
          ? !areAllTodosCompleted
          : todo.completed,
      }));

      setTodos(updatedTodos);

      setToggleCompleteAll(false);
      setIsUpdating(false);
      setUpdatingTodoId(null);
    } catch {
      setHasError(Errors.UnableToUpdate);
      setIsUpdating(false);
      setUpdatingTodoId(null);
      setToggleCompleteAll(true);
    }
  };

  return (
    <header className="todoapp__header">
      {isTodosNotEmpty && (
        <button
          type="button"
          className={cn('todoapp__toggle-all', { active: isAllTodosCompleted })}
          data-cy="ToggleAllButton"
          onClick={handleUpdateToCompleteAll}
        />
      )}
      <form onSubmit={handleSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          autoFocus
          value={title}
          onChange={event => setTitle(event.target.value)}
          disabled={isDisabled}
          ref={inputRef}
        />
      </form>
    </header>
  );
};
