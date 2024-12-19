import React, { useEffect } from 'react';
import { Todo } from '../../types/Todo';
import cn from 'classnames';

interface Props {
  title: string;
  setTitle: (title: string) => void;
  todos: Todo[];
  inputRef: React.RefObject<HTMLInputElement>;
  isHeaderDisabled: boolean;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleUpdateToCompleteAll: () => void;
}

export const Header: React.FC<Props> = props => {
  const {
    title,
    setTitle,
    todos,
    inputRef,
    isHeaderDisabled,
    handleSubmit,
    handleUpdateToCompleteAll,
  } = props;

  const isAllTodosCompleted = todos.every(todo => todo.completed);
  const isTodosNotEmpty = todos.length !== 0;

  useEffect(() => {
    inputRef.current?.focus();
  });

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
          disabled={isHeaderDisabled}
          ref={inputRef}
        />
      </form>
    </header>
  );
};
