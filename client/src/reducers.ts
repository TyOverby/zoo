import {ZooState, QueueState} from "./state";
import {ZooAction} from "./actions";
import {arrayWithModification} from "./util";
import {add_or_update, push_to_array} from "./update_state";

export const defaultState: ZooState = {
    view: 'viper',
    queues: {},
    errors: [],
    filter: {
        branch: {},
        prtest: false,
    }
}

export function zooReducer(state: ZooState, action: ZooAction): ZooState {
    if (state === undefined || state === null) {
        return defaultState;
    }

    switch (action.type) {
        case 'NEW_BRANCH':
            let branch = action.branch;
            return add_or_update(state, '|', `filter|branch|${action.branch}`, true);
        case 'LOADING_QUEUE':
            let loadingObj: QueueState = { status: 'loading', name: action.name, branch: action.branch};
            return add_or_update(state, '|', `queues|${action.name}`, loadingObj);
        case 'FAILED_QUEUE':
            let failedObj: QueueState = { status: 'failed', name: action.name, error: action.message, branch: action.branch};
            return add_or_update(state, '|', `queues|${action.name}`, failedObj);
        case 'LOADED_QUEUE':
            let loadedObj: QueueState = {
                status: 'loaded',
                name: action.name,
                url: action.url,
                path: action.path,
                runs: action.runs.sort((a, b) => b.id - a.id),
                collapsed: false,
                branch: action.branch,
            };
            return add_or_update(state, '|', `queues|${action.name}`, loadedObj);
        case 'COLLAPSE_ALL':
            return add_or_update(state, ".", `queues.*.collapsed`, true);
        case 'EXPAND_ALL':
            return add_or_update(state, ".", `queues.*.collapsed`, false);
        case 'TOGGLE_COLLAPSE_QUEUE':
            let was_collapsed: boolean = (state.queues[action.name] as any).collapsed;
            return add_or_update(state, '|', `queues|${action.name}|collapsed`, !was_collapsed);
        case 'TOGGLE_PR':
            let old_pr = state.filter.prtest;
            return add_or_update(state, '.', 'filter.prtest', !old_pr);
        default:
            return push_to_array(state, ".", "errors", {message: "unknown action", details: action});
    }
}