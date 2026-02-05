import { writable } from 'svelte/store';

export type DictationTarget =
    | { field: 'title' | 'description'; annotationId: string }
    | null;

function createDictation() {
    const { subscribe, set, update } = writable<DictationTarget>(null);

    return {
        subscribe,

        toggle(field, annotationId) {
            update((current) => {
                if (
                    current &&
                    current.field === field &&
                    current.annotationId === annotationId
                ) {
                    return null;
                }
                return { field, annotationId };
            });
        },

        stop() {
            set(null);
        }
    };
}

export const dictation = createDictation();
