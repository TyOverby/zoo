import {Store, Unsubscribe, Reducer as ReduxReducer} from "redux";

type Reducer<S, A> = (state: S, action: A) => S

export default class CustomStore<S, A> implements Store<S> {
    subs: (() => void)[]
    reducer: Reducer<S, A>;
    state: S;

    publishScheduled: boolean;

    constructor(reducer: Reducer<S, A>, defaultState: S) {
        this.subs = [];
        this.reducer = reducer;
        this.state = defaultState;
        this.publishScheduled = false;
    }

    schedulePublish() {
        if (!this.publishScheduled) {
            this.publishScheduled = true;
            window.requestAnimationFrame(() => {
                this.publishScheduled = false;
                for (let sub of this.subs) {
                    sub();
                }
            });
        }
    }

    dispatch(action: A) {
        this.state = this.reducer(this.state, action);
        this.schedulePublish();
    }

    getState(): S {
        return this.state;
    }

    subscribe(listener: () => void): Unsubscribe {
        this.subs.push(listener);
        return () => {
            this.subs = this.subs.filter((s) => s !== listener);
        }
    }

    replaceReducer(nextReducer: ReduxReducer<S>): void {
        throw "Dont use replaceReducer";
    }
}