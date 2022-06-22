import React, { useState, useEffect, Suspense } from 'react';
import cn from 'classnames';
import './App.scss';

const App = () => {
  const [token, setToken] = useState('');
  const [gameInitialized, setGameInitialized] = useState(false);
  const [gameLoading, setGameLoading] = useState(false);
  const [availableDirections, setAvailableDirections] = useState([]);

  useEffect(() => {
    if (token === '') return;
    updateAvailableDirections();
  }, [token]);

  const buttonClasses = cn({
    controls__button: true,
    controls__button_disabled: gameInitialized,
  });
  const headers = { Authorization: token };

  const updateAvailableDirections = () => {
    fetch('https://mazegame.plingot.com/Room/current', {
      headers,
      method: 'get',
    })
      .then((response) => response.json())
      .then(({ paths }) => {
        const directions = paths.map(({ direction }) => direction);
        setAvailableDirections(directions);
        setGameLoading(false);
      })
      .catch((error) => console.log(error));
  };

  const getToken = () =>
    fetch('https://mazegame.plingot.com/Game/Start', { method: 'post' });

  const handleStartButtonClick = () => {
    setGameInitialized(true);
    setGameLoading(true);

    getToken()
      .then((response) => response.json())
      .then((data) => setToken(data.token));
  };

  const goThisWay = ({ currentTarget }) => {
    setGameLoading(true);
    
    const {
      dataset: { direction },
    } = currentTarget;

    fetch(`https://mazegame.plingot.com/Player/move?direction=${direction}`, {
      headers,
      method: 'put',
    })
      .then(() => updateAvailableDirections())
      .catch((error) => console.log(error));
  };

  return (
    <div className='controls'>
      <h1 className='controls__header'>Escape the maze!</h1>
      {['North', 'East', 'South', 'West'].map((direction) => {
        const canGo = availableDirections.includes(direction) || null;
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

      <button className={buttonClasses} onClick={handleStartButtonClick}>
        {gameInitialized ? '' : 'Start!'}
        {gameLoading ? 'Loading...' : ''}
      </button>
    </div>
  );
};

export { App };
