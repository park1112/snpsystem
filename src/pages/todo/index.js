import TodoList from '../../components/todo/TodoList';
import Layout from '../../layouts';


const TodoListPage = () => <TodoList />;

TodoListPage.getLayout = function getLayout(page) {
    return <Layout>{page}</Layout>;
};

export default TodoListPage;
