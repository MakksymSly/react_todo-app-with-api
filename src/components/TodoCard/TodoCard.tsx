/* eslint-disable prettier/prettier */
import React, { useRef } from 'react';
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
  isUpdating: boolean;
  setIsUpdating: (isUpdating: boolean) => void;
  updatingTodoId: number | null;
  setUpdatingTodoId: (updatingTodoId: number | null) => void;
  toggleCompleteAll: boolean;
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
    isUpdating,
    setIsUpdating,
    updatingTodoId,
    setUpdatingTodoId,
    toggleCompleteAll,
  } = props;

  const [deletingCardId, setDeletingCardId] = React.useState<number | null>();
  const [isEditStatus, setIsEditStatus] = React.useState(false);
  const [editTitleQuery, setEditTitleQuery] = React.useState(title);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
          title: currTodo.title,
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

  const handleEditUpdate = async (
    event:
    | React.FormEvent<HTMLFormElement>
    | React.FocusEvent<HTMLInputElement, Element>
    | React.KeyboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    const currTodo = initialTodos.find(todo => todo.id === todoId);

    if (currTodo) {
      setIsUpdating(true);
      setUpdatingTodoId(currTodo.id);
    }


    if(!editTitleQuery.trim()) {
      handleDelete();
      setIsUpdating(false);

      return;
    }

    if (editTitleQuery === currTodo?.title) {
      setIsUpdating(false);
      setIsEditStatus(false);

      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }





    try {
      if (currTodo) {
        const todoToUpdate = {
          title: editTitleQuery.trim(),
          completed: currTodo.completed,
          userId: currTodo.userId,
        };

        await updateTodo(currTodo.id, todoToUpdate);

        setIsUpdating(false);
        setUpdatingTodoId(null);
        setTodos(initialTodos.map(todo =>
          (todo.id === currTodo.id ? { ...todoToUpdate, id: todo.id } : todo)));
        setIsEditStatus(false);

      }
    } catch {

      setHasError(Errors.UnableToUpdate);
      setIsUpdating(false);
      setUpdatingTodoId(null);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setHasError(Errors.NoError);
      }, 3000);
    }
  };

  const handleEscapeOrEnterButton =
    (event: React.KeyboardEvent<HTMLInputElement>) => {

      if (event.key === 'Escape') {
        setIsEditStatus(false);
        setEditTitleQuery(title);
      }

      if (event.key === 'Enter') {
        handleEditUpdate(event);
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

      {isEditStatus && (
        <form onSubmit={handleEditUpdate}>
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={editTitleQuery}
            onChange={event => setEditTitleQuery(event.target.value)}
            autoFocus
            onBlur={event => {
              handleEditUpdate(event);
              setIsEditStatus(false);
            }}
            onKeyDown={handleEscapeOrEnterButton}

          />
        </form>
      )}

      {!isEditStatus && (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => {
              setIsEditStatus(true);
            }}
          >
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
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', {
          'is-active':
            isTempTodo ||
            (isDeleting && deletingCardId === todoId) ||
            (isUpdating && updatingTodoId === todoId) ||
            toggleCompleteAll,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
