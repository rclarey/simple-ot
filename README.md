# simple-ot

[![Build Status](https://travis-ci.com/rclarey/simple-ot.svg?branch=master)](https://travis-ci.com/rclarey/simple-ot)
[![codecov](https://codecov.io/gh/rclarey/simple-ot/branch/master/graph/badge.svg)](https://codecov.io/gh/rclarey/simple-ot)

A simple operational transform library that uses the domain-agnostic GOTO control algorithm.

The implementation of the GOTO algorithm was written based on [this paper](https://dl.acm.org/citation.cfm?id=289469).

This repository also contains an implementation of inclusion and exclusion transformation functions, for character-wise operations on plaintext documents, that can be used with the GOTO algorithm.

For an example application using this library, see [cloudcode](https://github.com/rclarey/cloudcode).

## Install

```bash
yarn add simple-ot
```

or

```bash
npm install simple-ot --save
```

## Example

```typescript
import { charwise, OT } from './mod';
const {
  Delete,
  Insert,
  OperationType,
  deserialize,
  exclusionTransform,
  inclusionTransform,
  serialize,
} = charwise;
const id = /* some function that generates IDs that are unique across all sites (ex. uuid) */;

const siteID = 1;
// create the singleton OT object for this site
const ot = new OT(inclusionTransform, exclusionTransform, siteID);

const localInsert = new Insert('a', 0, id(), siteID, ot.history());

// local operations can be directly added to history
ot.addToHistory(localInsert);

// ... and then sent to other sites
const serializedLocal = serialize(localInsert);
sendToOtherSites(serializedLocal);


// ... some time later we receive an operation from another site

const remoteSerialized = {
  historyBuffer: [] as string[],
  id: 'EdSCYG6rxj',
  position: 1,
  siteID: 0,
  type: OperationType.DELETE,
};
const remoteDelete = deserialize(remoteSerialized);

// operations received from other sites need to be transformed before they
// can be applied at this site
const transformed = ot.goto(remoteDelete);

// now its safe to apply the operation and add it to history
applyOperation(transformed);
ot.addToHistory(transformed);
```

## API

For the high-level, domain-agnostic control alogrithm see [control.ts](https://github.com/rclarey/simple-ot/blob/master/control.ts).

For the implementation of character-wise inclusion and exclusion transformation functions see [charwise.ts](https://github.com/rclarey/simple-ot/blob/master/charwise.ts).
