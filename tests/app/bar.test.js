import test from 'ava';

import bar from '../../app/bar';

test('does something', t => {

	t.is(bar.something(true), true)

	t.is(bar.something(false), false)

})