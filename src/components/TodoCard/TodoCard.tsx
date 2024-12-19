/* eslint-disable prettier/prettier */
import cn from 'classnames';
import { updateTodo } from '../../api/todos';
import { Todo } from '../../types/Todo';
import { Errors } from '../../types/Errors';
import { useState } from 'react';

interface Props {
  title: string;
  isCompleted: boolean;
  isDeleting: boolean;
  todoId: number;
  setIsDeleting: (isDeleting: boolean) => void;
  setTodos: (todos: Todo[]) => void;
  setHasError: (hasError: Errors) => void;
  initialTodos: Todo[];
  isUpdating: boolean;
  setIsUpdating: (isUpdating: boolean) => void;
  updatingTodoId: number | null;
  setUpdatingTodoId: (updatingTodoId: number | null) => void;
  toggleCompleteAll: boolean;
  handleDelete: (todoId: number) => void;
  deletingCardId: number | null;
}

/* eslint-disable jsx-a11y/label-has-associated-control */
export const TodoCard: React.FC<Props> = props => {
  const {
    title,
    isCompleted,
    isDeleting,
    todoId,
    setTodos,
    setHasError,
    initialTodos,
    isUpdating,
    setIsUpdating,
    updatingTodoId,
    setUpdatingTodoId,
    toggleCompleteAll,
    handleDelete,
    deletingCardId,
  } = props;


  const [isEditStatus, setIsEditStatus] = useState(false);
  const [editTitleQuery, setEditTitleQuery] = useState(title);
  const [isUpdateRunning, setIsUpdateRunning] = useState(false);



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

  const handleEditUpdate =  async (
    event:
    | React.FormEvent<HTMLFormElement>
    | React.FocusEvent<HTMLInputElement, Element>
    | React.KeyboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    if( isUpdateRunning) {
      return;
    }

    setIsUpdateRunning(true);
    const currTodo = initialTodos.find(todo => todo.id === todoId);

    if (currTodo) {
      setIsUpdating(true);
      setUpdatingTodoId(currTodo.id);
    }


    if(!editTitleQuery.trim()) {
      await handleDelete(todoId);
      setIsUpdating(false);
      setIsUpdateRunning(false);

      return;
    }

    if (editTitleQuery === currTodo?.title) {
      setIsUpdating(false);
      setIsEditStatus(false);
      setIsUpdateRunning(false);

      return;
    }

    try {

      if (currTodo) {
        const todoToUpdate = {
          title: editTitleQuery.trim(),
          completed: currTodo.completed,
          userId: currTodo.userId,
        };

        await updateTodo( currTodo.id, todoToUpdate);

        setIsUpdating(false);
        setUpdatingTodoId(null);
        setTodos(initialTodos.map(todo =>
          (todo.id === currTodo.id ? { ...todoToUpdate, id: todo.id } : todo)));
        setIsEditStatus(false);
        setIsUpdateRunning(false);

      }
    } catch {

      setHasError(Errors.UnableToUpdate);
      setIsUpdating(false);
      setUpdatingTodoId(null);
      setIsUpdateRunning(false);
    }
  };

  const handleEscapeButton =
    (event: React.KeyboardEvent<HTMLInputElement>) => {

      if (event.key === 'Escape') {
        setIsEditStatus(false);
        setEditTitleQuery(title);
      }
    };

  const handleOnblur = (event: React.FocusEvent<HTMLInputElement, Element>) => {
    if (!isUpdateRunning) {
      handleEditUpdate(event);
      setIsEditStatus(false);
    }

    return;
  };

  const isLoaderVisible = (isDeleting && deletingCardId === todoId) ||
  (isUpdating && updatingTodoId === todoId) ||
  toggleCompleteAll;

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
            onBlur={handleOnblur}
            onKeyDown={handleEscapeButton}

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
            onClick={() => handleDelete(todoId)}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', {
          'is-active': isLoaderVisible
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
