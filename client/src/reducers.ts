import {ZooState, QueueState} from "./state";
import {ZooAction} from "./actions";
import {arrayWithModification} from "./util";

const defaultState: ZooState = {
    view: 'viper',
    queues: [],
    errors: [],
}

export function zooReducer(state: ZooState, action: ZooAction): ZooState {
    if (state === undefined || state === null) {
        return defaultState;
    }

    switch (action.type) {
        case 'LOADING_QUEUE':
            let loadingObj: QueueState = { status: 'loading', name: action.name};
            return {
                ...state,
                queues: arrayWithModification(state.queues, (v) => v.name == action.name, (v) => loadingObj, () => loadingObj) 
            };
        case 'FAILED_QUEUE':
            let failedObj: QueueState = { status: 'failed', name: action.name, error: action.message};
            return {
                ...state,
                queues: arrayWithModification(state.queues, (v) => v.name == action.name, (v) => failedObj, () => failedObj) 
            };
        case 'LOADED_QUEUE':
            let loadedObj: QueueState = { 
                status: 'loaded', 
                name: action.name, 
                url: action.url,
                path: action.path,
                runs: action.runs,
                collapsed: false,
            };
            return {
                ...state,
                queues: arrayWithModification(state.queues, (v) => v.name == action.name, (v) => loadedObj, () => loadedObj) 
            };
        case 'TOGGLE_COLLAPSE_QUEUE':
            return {
                ...state,
                queues: arrayWithModification(state.queues, (v) => v.name == action.name, 
                (v) => ({...v, collapsed: !(v as any).collapsed}), 
                () => null) 
            };
        default:
            return { ...state, errors: [... state.errors, {
                message: "unknown action",
                details: action,
            }]}
    }
}