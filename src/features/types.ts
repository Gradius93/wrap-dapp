export interface Action {
    type: string;
}

export interface Dispatch {
    <A extends Action = Action>(a: A): void;
}

export interface Store<T> {
    getState(): T;

    dispatch<A extends Action>(a: A): void;
}

export interface Middleware<T> {
    <A extends Action>(store: Store<T>, a: A): (next: Dispatch) => any;
}

export function createStore<T>(state: T, dispatch: Dispatch) {
    return {
        getState: () => state,
        dispatch,
    };
}

export function connectStore<T>(
    store: Store<T>,
    ...middlewares: Middleware<T>[]
) {
    return middlewares.reduceRight((acc, v) => {
        return (a) => v(store, a)(acc);
    }, store.dispatch);
}
