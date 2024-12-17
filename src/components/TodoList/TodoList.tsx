import { Todo } from '../../types/Todo';
import { Errors } from '../../utils/Errors';
import { TodoCard } from '../TodoCard/TodoCard';

interface Props {
  todos: Todo[];
  tempTodo: Todo | null;
  isDeleting: boolean;
  setIsDeleting: (isDeleting: boolean) => void;
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
export const TodoList: React.FC<Props> = props => {
  const {
    todos,
    tempTodo,
    isDeleting,
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

  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => {
        return (
          <TodoCard
            key={todo.id}
            title={todo.title}
            isCompleted={todo.completed}
            isTempTodo={false}
            isDeleting={isDeleting}
            todoId={todo.id}
            setIsDeleting={setIsDeleting}
            todos={todos}
            setTodos={setTodos}
            setHasError={setHasError}
            inputRef={inputRef}
            initialTodos={initialTodos}
            isUpdating={isUpdating}
            setIsUpdating={setIsUpdating}
            updatingTodoId={updatingTodoId}
            setUpdatingTodoId={setUpdatingTodoId}
            toggleCompleteAll={toggleCompleteAll}
          />
        );
      })}
      {tempTodo && (
        <TodoCard
          title={tempTodo.title}
          isCompleted={false}
          isTempTodo={true}
          todoId={tempTodo.id}
          isDeleting={isDeleting}
          setIsDeleting={setIsDeleting}
          todos={todos}
          setTodos={setTodos}
          setHasError={setHasError}
          inputRef={inputRef}
          initialTodos={initialTodos}
          isUpdating={isUpdating}
          setIsUpdating={setIsUpdating}
          updatingTodoId={updatingTodoId}
          setUpdatingTodoId={setUpdatingTodoId}
          toggleCompleteAll={toggleCompleteAll}
        />
      )}
    </section>
  );
};
