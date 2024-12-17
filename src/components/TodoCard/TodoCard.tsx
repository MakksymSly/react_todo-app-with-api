import React from 'react';
import cn from 'classnames';
import { deleteTodo, updateTodo } from '../../api/todos';
import { Todo } from '../../types/Todo';
import { Errors } from '../../utils/Errors';
interface Props {
  title: string;
  isCompleted: boolean;
  isTempTodo: boolean;
  isDeleting: boolean;
  todoId: number;
  setIsDeleting: (isDeleting: boolean) => void;
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  setHasError: (hasError: Errors) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  initialTodos: Todo[];
}
/* eslint-disable jsx-a11y/label-has-associated-control */
export const TodoCard: React.FC<Props> = props => {
  const {
    title,
    isCompleted,
    isTempTodo,
    isDeleting,
    todoId,
    setIsDeleting,
    setTodos,
    setHasError,
    inputRef,
    initialTodos,
  } = props;

  const [deletingCardId, setDeletingCardId] = React.useState<number | null>();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [updatingTodoId, setUpdatingTodoId] = React.useState<number | null>();

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeletingCardId(todoId);

    try {
      await deleteTodo(todoId);
      setIsDeleting(false);
      setDeletingCardId(null);
      setTodos(initialTodos.filter(todo => todo.id !== todoId));
      setDeletingCardId(null);
      inputRef.current?.focus();
    } catch {
      setHasError(Errors.UnableToDelete);
      setIsDeleting(false);
      setDeletingCardId(null);
    }
  };

  const handleComplete = async () => {
    const currTodo = initialTodos.find(todo => todo.id === todoId);

    setIsUpdating(true);
    setUpdatingTodoId(todoId);

    try {
      if (currTodo) {
        await updateTodo(currTodo.id, {
          completed: !currTodo.completed,
          userId: currTodo.userId,
        });

        const updatedTodos = initialTodos.map(todo =>
          todo.id === currTodo.id
            ? { ...todo, completed: !currTodo.completed }
            : todo,
        );

        setIsUpdating(false);
        setTodos(updatedTodos);
      }
    } catch {
      setIsUpdating(false);
      setHasError(Errors.UnableToUpdate);
    }
  };

  return (
    <div data-cy="Todo" className={cn('todo', { completed: isCompleted })}>
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={isCompleted}
          onChange={handleComplete}
        />
      </label>

      <span data-cy="TodoTitle" className="todo__title">
        {title}
      </span>

      <button
        type="button"
        className="todo__remove"
        data-cy="TodoDelete"
        onClick={handleDelete}
      >
        ×
      </button>

      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', {
          'is-active':
            isTempTodo ||
            (isDeleting && deletingCardId === todoId) ||
            (isUpdating && updatingTodoId === todoId),
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
