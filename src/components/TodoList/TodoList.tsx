import { Todo } from '../../types/Todo';
import { Errors } from '../../types/Errors';
import { TodoCard } from '../TodoCard/TodoCard';
import { TodoCardTemplate } from '../TodoCard/TodoCardTemplate';

interface Props {
  todos: Todo[];
  tempTodo: Todo | null;
  isDeleting: boolean;
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
export const TodoList: React.FC<Props> = props => {
  const {
    todos,
    tempTodo,
    isDeleting,
    setIsDeleting,
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

  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => {
        return (
          <TodoCard
            key={todo.id}
            title={todo.title}
            isCompleted={todo.completed}
            isDeleting={isDeleting}
            todoId={todo.id}
            setIsDeleting={setIsDeleting}
            setTodos={setTodos}
            setHasError={setHasError}
            initialTodos={initialTodos}
            isUpdating={isUpdating}
            setIsUpdating={setIsUpdating}
            updatingTodoId={updatingTodoId}
            setUpdatingTodoId={setUpdatingTodoId}
            toggleCompleteAll={toggleCompleteAll}
            handleDelete={handleDelete}
            deletingCardId={deletingCardId}
          />
        );
      })}
      {tempTodo && <TodoCardTemplate title={tempTodo.title} />}
    </section>
  );
};
