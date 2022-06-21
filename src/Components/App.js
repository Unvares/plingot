import React, { useState, useEffect, Suspense } from 'react';
import cn from 'classnames';
import './App.scss';

const App = () => {
  const [token, setToken] = useState('');
  const [gameState, setGameState] = useState(false);
  const [directions, setDirections] = useState([]);

  const buttonClasses = cn({
    controls__button: true,
    controls__button_disabled: gameState,
  });
  const headers = { Authorization: token };

  useEffect(() => {
    if (token === '') return;
    updateDirections();
  }, [token]);

  const updateDirections = () => {
    fetch('https://mazegame.plingot.com/Room/current', {
      headers,
      method: 'get',
    })
      .then((response) => response.json())
      .then((data) => data.paths.map(({ direction }) => direction))
      .then((directions) => setDirections(directions))
      .catch((error) => console.log(error));
  };

  const disableStartButton = () => setGameState(true);

  const getToken = () => {
    disableStartButton();

    fetch('https://mazegame.plingot.com/Game/Start', { method: 'post' })
      .then((response) => response.json())
      .then((data) => setToken(data.token));
  };

  const goThisWay = ({ currentTarget }) => {
    const {
      dataset: { direction },
    } = currentTarget;

    fetch(`https://mazegame.plingot.com/Player/move?direction=${direction}`, {
      headers,
      method: 'put',
    })
      .then(() => updateDirections())
      .catch((error) => console.log(error));
  };

  return (
    <div className='controls'>
      <h1 className='controls__header'>Escape the maze!</h1>
      {['North', 'East', 'South', 'West'].map((direction) => {
        const canGo = directions.includes(direction) || null;
        const commonClass = { controls__arrow_disabled: !canGo };

        return (
          <div
            className={
              'controls__arrow controls__arrow_' + direction.toLowerCase()
            }
            data-direction={direction}
            key={direction}
            onClick={canGo && goThisWay}
          >
            <div className={cn(commonClass, 'controls__arow_top')} />
            <div className={cn(commonClass, 'controls__arow_bottom')} />
          </div>
        );
      })}
      {token === '' && (
        <button className={buttonClasses} onClick={getToken}>
          {gameState ? 'Loading...' : 'Start!'}
        </button>
      )}
    </div>
  );
};

export { App };
