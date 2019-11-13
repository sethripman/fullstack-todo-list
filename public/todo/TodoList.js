import Component from '../Component.js';
import TodoItem from './TodoItem.js';

class TodoList extends Component {
    
    onRender(list) {
        const todos = this.props.todos;
        const onUpdate = this.props.onUpdate;
        const onRemove = this.props.onRemove;

        todos
            .map(todo => new TodoItem({ todo, onUpdate, onRemove }))
            .map(todoItem => todoItem.renderDOM())
            .forEach(dom => list.appendChild(dom));
    }
    renderHTML() {
        return /*html*/`
            <ul class="todos"></ul>
        `;
    }
}

export default TodoList;