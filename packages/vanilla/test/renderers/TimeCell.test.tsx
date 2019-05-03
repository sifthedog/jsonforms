/*
  The MIT License
  
  Copyright (c) 2017-2019 EclipseSource Munich
  https://github.com/eclipsesource/jsonforms
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
import '@jsonforms/test';
import * as React from 'react';
import test from 'ava';
import {
  ControlElement,
  getData,
  HorizontalLayout,
  JsonSchema,
  update
} from '@jsonforms/core';
import HorizontalLayoutRenderer from '../../src/layouts/HorizontalLayout';
import TimeCell, { timeCellTester } from '../../src/cells/TimeCell';
import { Provider } from 'react-redux';
import * as TestUtils from 'react-dom/test-utils';
import { initJsonFormsVanillaStore } from '../vanillaStore';
import { JsonFormsReduxContext } from '@jsonforms/react';

test.beforeEach(t => {
  t.context.data = { 'foo': '13:37' };
  t.context.schema = {
    type: 'string',
    format: 'time'
  };
  t.context.uischema = {
    type: 'Control',
    scope: '#/properties/foo'
  };
  t.context.styles = [
    {
      name: 'control',
      classNames: ['control']
    },
    {
      name: 'control.validation',
      classNames: ['validation']
    }
  ];
});

test.failing('autofocus on first element', t => {
  const schema: JsonSchema = {
    type: 'object',
    properties: {
      firstDate: { type: 'string', format: 'date' },
      secondDate: { type: 'string', format: 'date' }
    }
  };
  const firstControlElement: ControlElement = {
    type: 'Control',
    scope: '#/properties/firstDate',
    options: {
      focus: true
    }
  };
  const secondControlElement: ControlElement = {
    type: 'Control',
    scope: '#/properties/secondDate',
    options: {
      focus: true
    }
  };
  const uischema: HorizontalLayout = {
    type: 'HorizontalLayout',
    elements: [
      firstControlElement,
      secondControlElement
    ]
  };
  const data = {
    'firstDate': '1980-04-04',
    'secondDate': '1980-04-04'
  };
  const store = initJsonFormsVanillaStore({
    data,
    schema,
    uischema
  });
  const tree: React.Component<any> = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <HorizontalLayoutRenderer schema={schema} uischema={uischema} />
    </Provider>
  ) as unknown as React.Component<any>;
  const inputs = TestUtils.scryRenderedDOMComponentsWithTag(tree, 'input');
  t.not(document.activeElement, inputs[0]);
  t.is(document.activeElement, inputs[1]);
});

test('autofocus active', t => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/foo',
    options: {
      focus: true
    }
  };
  const store = initJsonFormsVanillaStore({
    data: t.context.data,
    schema: t.context.schema,
    uischema
  });
  const tree: React.Component<any> = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <TimeCell schema={t.context.schema} uischema={uischema} path='foo' />
    </Provider>
  ) as unknown as React.Component<any>;
  const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
  t.is(document.activeElement, input);
});

test('autofocus inactive', t => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/foo',
    options: {
      focus: false
    }
  };
  const store = initJsonFormsVanillaStore({
    data: t.context.data,
    schema: t.context.schema,
    uischema
  });
  const tree: React.Component<any> = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <TimeCell schema={t.context.schema} uischema={uischema} path='foo' />
    </Provider>
  ) as unknown as React.Component<any>;
  const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
  t.false(input.autofocus);
});

test('autofocus inactive by default', t => {
  const uischema: ControlElement = {
    type: 'Control',
    scope: '#/properties/foo'
  };
  const store = initJsonFormsVanillaStore({
    data: t.context.data,
    schema: t.context.schema,
    uischema
  });
  const tree: React.Component<any> = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <TimeCell schema={t.context.schema} uischema={uischema} path='foo' />
    </Provider>
  ) as unknown as React.Component<any>;
  const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
  t.false(input.autofocus);
});

test('tester', t => {
  t.is(timeCellTester(undefined, undefined), -1);
  t.is(timeCellTester(null, undefined), -1);
  t.is(timeCellTester({ type: 'Foo' }, undefined), -1);
  t.is(timeCellTester({ type: 'Control' }, undefined), -1);
});

test('tester with wrong prop type', t => {
  t.is(
    timeCellTester(
      t.context.uischmea,
      {
        type: 'object',
        properties: {
          foo: { type: 'string' },
        },
      },
    ),
    -1,
  );
});

test('tester with wrong prop type, but sibling has correct one', t => {
  t.is(
    timeCellTester(
      t.context.uischema,
      {
        type: 'object',
        properties: {
          foo: { type: 'string' },
          bar: {
            type: 'string',
            format: 'time'
          },
        },
      },
    ),
    -1,
  );
});

test('tester with correct prop type', t => {
  t.is(
    timeCellTester(
      t.context.uischema,
      {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
            format: 'time',
          },
        },
      },
    ),
    2,
  );
});

test('render', t => {
  const store = initJsonFormsVanillaStore({
    data: t.context.data,
    schema: t.context.schema,
    uischema: t.context.uischema,
    styles: t.context.styles
  });
  const tree: React.Component<any> = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <JsonFormsReduxContext>
        <TimeCell schema={t.context.schema} uischema={t.context.uischema} path='foo' />
      </JsonFormsReduxContext>
    </Provider>
  ) as unknown as React.Component<any>;

  const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
  t.is(input.type, 'time');
  t.is(input.value, '13:37');
});

test.cb('update via event', t => {
  const store = initJsonFormsVanillaStore({
    data: t.context.data,
    schema: t.context.schema,
    uischema: t.context.uischema,
    styles: t.context.styles
  });
  const tree: React.Component<any> = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <JsonFormsReduxContext>
        <TimeCell schema={t.context.schema} uischema={t.context.uischema} path='foo' />
      </JsonFormsReduxContext>
    </Provider>
  ) as unknown as React.Component<any>;
  const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
  input.value = '20:15';
  TestUtils.Simulate.change(input);
  setTimeout(() => { t.is(getData(store.getState()).foo, '20:15'); t.end(); }, 100);
});

test.cb('update via action', t => {
  const store = initJsonFormsVanillaStore({
    data: t.context.data,
    schema: t.context.schema,
    uischema: t.context.uischema,
    styles: t.context.styles
  });
  const tree: React.Component<any> = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <JsonFormsReduxContext>
        <TimeCell schema={t.context.schema} uischema={t.context.uischema} path='foo' />
      </JsonFormsReduxContext>
    </Provider>
  ) as unknown as React.Component<any>;
  const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
  store.dispatch(update('foo', () => '20:15'));
  setTimeout(() => { t.is(input.value, '20:15'); t.end(); }, 100);
});

test('update with null value', t => {
  const store = initJsonFormsVanillaStore({
    data: t.context.data,
    schema: t.context.schema,
    uischema: t.context.uischema,
    styles: t.context.styles
  });
  const tree: React.Component<any> = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <TimeCell schema={t.context.schema} uischema={t.context.uischema} path='foo' />
    </Provider>
  ) as unknown as React.Component<any>;
  const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
  store.dispatch(update('foo', () => null));
  t.is(input.value, '');
});

test('update with undefined value', t => {
  const store = initJsonFormsVanillaStore({
    data: t.context.data,
    schema: t.context.schema,
    uischema: t.context.uischema,
    styles: t.context.styles
  });
  const tree: React.Component<any> = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <JsonFormsReduxContext>
        <TimeCell schema={t.context.schema} uischema={t.context.uischema} path='foo' />
      </JsonFormsReduxContext>
    </Provider>
  ) as unknown as React.Component<any>;
  const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
  store.dispatch(update('foo', () => undefined));
  t.is(input.value, '');
});

test('update with wrong ref', t => {
  const store = initJsonFormsVanillaStore({
    data: t.context.data,
    schema: t.context.schema,
    uischema: t.context.uischema,
    styles: t.context.styles
  });
  const tree: React.Component<any> = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <JsonFormsReduxContext>
        <TimeCell schema={t.context.schema} uischema={t.context.uischema} path='foo' />
      </JsonFormsReduxContext>
    </Provider>
  ) as unknown as React.Component<any>;
  const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
  store.dispatch(update('bar', () => 'Bar'));
  t.is(input.value, '13:37');
});

test('update with null ref', t => {
  const store = initJsonFormsVanillaStore({
    data: t.context.data,
    schema: t.context.schema,
    uischema: t.context.uischema,
    styles: t.context.styles
  });
  const tree: React.Component<any> = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <JsonFormsReduxContext>
        <TimeCell schema={t.context.schema} uischema={t.context.uischema} path='foo' />
      </JsonFormsReduxContext>
    </Provider>
  ) as unknown as React.Component<any>;
  const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
  store.dispatch(update(null, () => '20:15'));
  t.is(input.value, '13:37');
});

test('update with undefined ref', t => {
  const store = initJsonFormsVanillaStore({
    data: t.context.data,
    schema: t.context.schema,
    uischema: t.context.uischema,
    styles: t.context.styles
  });
  const tree: React.Component<any> = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <JsonFormsReduxContext>
        <TimeCell schema={t.context.schema} uischema={t.context.uischema} path='foo' />
      </JsonFormsReduxContext>
    </Provider>
  ) as unknown as React.Component<any>;
  const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
  store.dispatch(update(undefined, () => '20:15'));
  t.is(input.value, '13:37');
});

test('disable', t => {
  const store = initJsonFormsVanillaStore({
    data: t.context.data,
    schema: t.context.schema,
    uischema: t.context.uischema,
    styles: t.context.styles
  });
  const tree: React.Component<any> = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <JsonFormsReduxContext>
        <TimeCell schema={t.context.schema} uischema={t.context.uischema} path='foo' enabled={false} />
      </JsonFormsReduxContext>
    </Provider>
  ) as unknown as React.Component<any>;
  const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
  t.true(input.disabled);
});

test('enabled by default', t => {
  const store = initJsonFormsVanillaStore({
    data: t.context.data,
    schema: t.context.schema,
    uischema: t.context.uischema,
    styles: t.context.styles
  });
  const tree: React.Component<any> = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <JsonFormsReduxContext>
        <TimeCell schema={t.context.schema} uischema={t.context.uischema} path='foo' />
      </JsonFormsReduxContext>
    </Provider>
  ) as unknown as React.Component<any>;
  const input = TestUtils.findRenderedDOMComponentWithTag(tree, 'input') as HTMLInputElement;
  t.false(input.disabled);
});
