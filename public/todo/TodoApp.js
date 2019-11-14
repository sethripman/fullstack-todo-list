import Component from '../Component.js';
import Header from '../common/Header.js';
import Loading from '../common/Loading.js';
import AddTodoBox from './AddTodoBox.js';
import TodoList from './TodoList.js';
import { getTodos, addTodo, updateTodo, removeTodo } from '../services/todo-api.js';

class TodoApp extends Component {

    async onRender(dom) {
        const header = new Header({ title: 'My Todos' });
        dom.prepend(header.renderDOM());
        
        const main = dom.querySelector('main');
        const error = dom.querySelector('.error');

        const loading = new Loading({ loading: true });
        dom.appendChild(loading.renderDOM());

        const addTodoBox = new AddTodoBox({
            onAdd: async todo => {
                loading.update({ loading: true });
                error.textContent = '';

                try {
                    const saved = await addTodo(todo);
                    const todos = this.state.todos;
                    todos.push(saved);
                    todoList.update({ todos });
                }
                catch (err) {
                    error.textContent = err;
                    throw err;
                }
                finally {
                    loading.update({ loading: false });
                }
            }
        });
        main.appendChild(addTodoBox.renderDOM());

        const todoList = new TodoList({ 
            todos: [],
            onUpdate: async todo => {
                loading.update({ loading: true });
                error.textContent = '';

                try {
                    const updated = await updateTodo(todo);
                    const todos = this.state.todos;
                    const index = todos.indexOf(todo);
                    todos.splice(index, 1, updated);

                    todoList.update({ todos });
                }
                catch (err) {
                    console.log(err);
                }
                finally {
                    loading.update({ loading: false });
                }
            },
            onRemove: async todo => {
                loading.update({ loading: true });
                error.textContent = '';

                try {
                    await removeTodo(todo.id);
                    
                    const todos = this.state.todos;        
                    const index = todos.indexOf(todo);
                    todos.splice(index, 1);
    
                    todoList.update({ todos });
                }
                catch (err) {
                    console.log(err);
                }
                finally {
                    loading.update({ loading: false });
                }
            }
        });
        main.appendChild(todoList.renderDOM());

        try {
            const todos = await getTodos({ showAll: true });
            this.state.todos = todos;
    
            todoList.update({ todos });
        }
        catch (err) {
            console.log(err);
        }
        finally {
            loading.update({ loading: false });
        }

    }

    renderHTML() {
        return /*html*/`
            <div>
                <p class="error"></p>
                <main>
                </main>
            </div>
        `;
    }
}

export default TodoApp;