<div>
    <strong>{this.getDone().length}</strong>
    done,
    <strong>{this.getPending().length}</strong>
    pending
    <br/>
    <div rt-repeat="todo in this.state.todos" key="{todo.key}">
        <img src="img/samples/delete.png"
             onClick="()=>this.remove(todo)"
             title="Remove Todo"
             style="cursor:pointer"/>
        <input type="checkbox" checked="{todo.done}"
               onChange="()=>this.toggleChecked(todoIndex)"/>
        <span style="text-decoration: {todo.done ? 'line-through': 'none'}">{todo.value}</span>
    </div>
    <input key="myinput" style="width:130px" type="text"
           onKeyDown="(e) => if (e.keyCode == 13) { e.preventDefault(); this.add(); }"
           valueLink="{this.linkState('edited')}"/>
    <button onClick="()=>this.add()">Add</button><br/>
    <button onClick="()=>this.clearDone()">Clear done</button>
</div>