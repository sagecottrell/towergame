import { useContext } from 'react';
import { SaveFileContext } from '../context/SaveFileContext.ts';

export function BuildingSelect() {
    const [state, dispatch] = useContext(SaveFileContext);

    const buildings = state.buildings.map((x) => (
        <button type={'button'} key={x.id} onClick={() => dispatch({ action: 'load-building', building_id: x.id })}>
            Building {x.id}
        </button>
    ));
    return <div>{buildings}</div>;
}
