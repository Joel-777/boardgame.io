/*
 * Copyright 2018 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createStore } from 'redux';
import { Local } from './local';
import Game from '../../core/game';
import { makeMove } from '../../core/action-creators';
import { CreateGameReducer } from '../../core/reducer';
import * as Actions from '../../core/action-types';

describe('update gameID / playerID', () => {
  const master = { onSync: jest.fn() };
  const store = { dispatch: () => {} };
  const m = new Local({ master, store });

  test('gameID', async () => {
    await m.updateGameID('test');
    expect(m.gameID).toBe('default:test');
    expect(master.onSync).lastCalledWith('default:test', null, 2);
  });

  test('playerID', async () => {
    await m.updatePlayerID('player');
    expect(m.playerID).toBe('player');
    expect(master.onSync).lastCalledWith('default:test', 'player', 2);
  });
});

describe('multiplayer', () => {
  const master = { onSync: jest.fn(), onUpdate: jest.fn() };
  const m = new Local({ master });
  const game = Game({});
  let store = null;

  beforeEach(() => {
    m.store = store = createStore(CreateGameReducer({ game }));
  });

  test('returns a valid store', () => {
    expect(store).not.toBe(undefined);
  });

  test('receive update', () => {
    const restored = { restore: true };
    expect(store.getState()).not.toMatchObject(restored);
    m.onUpdate('unknown gameID', restored);
    expect(store.getState()).not.toMatchObject(restored);
    m.onUpdate('default:default', restored);
    expect(store.getState()).not.toMatchObject(restored);

    // Only if the stateID is not stale.
    restored._stateID = 1;
    m.onUpdate('default:default', restored);
    expect(store.getState()).toMatchObject(restored);
  });

  test('receive sync', () => {
    const restored = { restore: true };
    expect(store.getState()).not.toMatchObject(restored);
    m.onSync('unknown gameID', restored);
    expect(store.getState()).not.toMatchObject(restored);
    m.onSync('default:default', restored);
    expect(store.getState()).toMatchObject(restored);
  });

  test('send update', () => {
    const action = makeMove();
    const state = { _stateID: 0 };
    m.onAction(state, action);
    expect(m.master.onUpdate).lastCalledWith(
      action,
      state._stateID,
      'default:default',
      null
    );
  });
});

/*
describe('server option', () => {
  const hostname = 'host';
  const port = '1234';

  test('without protocol', () => {
    const server = hostname + ':' + port;
    const m = new SocketIO({ server });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(false);
  });

  test('https', () => {
    const serverWithProtocol = 'https://' + hostname + ':' + port + '/';
    const m = new SocketIO({ server: serverWithProtocol });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(true);
  });

  test('http', () => {
    const serverWithProtocol = 'http://' + hostname + ':' + port + '/';
    const m = new SocketIO({ server: serverWithProtocol });
    m.connect();
    expect(m.socket.io.engine.hostname).toEqual(hostname);
    expect(m.socket.io.engine.port).toEqual(port);
    expect(m.socket.io.engine.secure).toEqual(false);
  });

  test('no server set', () => {
    const m = new SocketIO();
    m.connect();
    expect(m.socket.io.engine.hostname).not.toEqual(hostname);
    expect(m.socket.io.engine.port).not.toEqual(port);
  });
});

test('changing a gameID resets the state before resync', () => {
  const m = new SocketIO();
  const game = Game({});
  const store = createStore(CreateGameReducer({ game }));
  m.store = store;
  const dispatchSpy = jest.spyOn(store, 'dispatch');

  m.updateGameID('foo');

  expect(dispatchSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      type: Actions.RESET,
      clientOnly: true,
    })
  );
});

test('changing a playerID resets the state before resync', () => {
  const m = new SocketIO();
  const game = Game({});
  const store = createStore(CreateGameReducer({ game }));
  m.store = store;
  const dispatchSpy = jest.spyOn(store, 'dispatch');

  m.updatePlayerID('foo');

  expect(dispatchSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      type: Actions.RESET,
      clientOnly: true,
    })
  );
});
*/
