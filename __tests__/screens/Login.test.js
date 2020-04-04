import React from 'react';
import renderer from 'react-test-renderer';

import Login from '../../src/screens/Auth/Login';
import { isExportDeclaration } from 'typescript';

describe('<Login />', () => {
  it('Login', () => {
    const tree = renderer.create(<Login />).toJSON();
    expect(tree.children).toHaveLength(1);
    expect(tree).toMatchSnapshot();
  });
});
