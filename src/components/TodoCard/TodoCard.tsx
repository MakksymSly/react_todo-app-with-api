/* eslint-disable prettier/prettier */
import cn from 'classnames';
import { deleteTodo, updateTodo } from '../../api/todos';
import { Todo } from '../../types/Todo';
import { Errors } from '../../utils/Errors';
import { useState } from 'react';



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

  const [deletingCardId, setDeletingCardId] = useState<number | null>(null);
  const [isEditStatus, setIsEditStatus] = useState<boolean>(false);
  const [editTitleQuery, setEditTitleQuery] = useState<string>(title);
  const [isUpdateRunning, setIsUpdateRunning] = useState<boolean>(false);


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
      await handleDelete();
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
