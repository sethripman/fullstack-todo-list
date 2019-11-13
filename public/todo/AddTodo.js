import Component from '../Component.js';

class AddTodoBox extends Component {

    onRender(dom) {
        const onAdd = this.props.onAdd;
        const form = dom.querySelector('form');
        const input = dom.querySelector('input[name=todo]');
        form.addEventListener('submit', async event => {
            event.preventDefault();

            const todo = {
                task: input.value
            };

            try {
                await onAdd(todo);
                form.reset();
                document.activeElement.blur();
            }
            catch (err) {
                // butts
            }
        });
    }

    renderHTML() {
        return /*html*/`
            <section class="todo-form-section">
                <form class="todo-form">
                    <input name="todo" required>
                    <button>Add</button>
                </form>
            </section>
        `;
    }
}

export default AddTodoBox;