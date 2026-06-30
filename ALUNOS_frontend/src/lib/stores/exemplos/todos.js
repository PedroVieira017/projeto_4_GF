import { randomid } from '$lib/uteis';
import { writable } from 'svelte/store';

export const todos = writable([]);

// @ts-ignore
export const addTodo = (text) => {
    // @ts-ignore
    todos.update((cur) => {
        const newTodos = [...cur, { id: randomid(12), text, completed: false, createdAt: Date.now() }];
        return newTodos;
    });
};

// @ts-ignore
export const deleteTodo = (id) => {
    // @ts-ignore
    todos.update((todos) => todos.filter((todo) => todo.id !== id));
};

// @ts-ignore
export const completeTodo = (id) => {
    todos.update((todos) => {
        let index = -1;
        for (let i = 0; i < todos.length; i++) {
            // @ts-ignore
            if (todos[i].id === id) {
                index = i;
                break;
            }
        }
        if (index !== -1) {
            // @ts-ignore
            todos[index].completed = !todos[index].completed;
        }
        return todos;
    });
};

