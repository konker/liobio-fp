import fs from 'fs';

import * as P from '../src/prelude';
type Line = string;
const LINES = ['toni', 'konker', 'james'];
let i = 0;

const readline: P.TaskEither<unknown, P.Option<Line>> = P.TaskEither_.tryCatch(async () => {
  return P.Option_.fromNullable(LINES[i++]);
}, P.identity);

const writeline: (line: Line) => P.TaskEither<unknown, void> = (line: Line) =>
  P.TaskEither_.tryCatch(async () => {
    process.stdout.write(line);
    process.stdout.write('\n');
    return;
  }, P.identity);

const main: P.Task<void> = P.pipe(
  readline,
  P.TaskEither_.map((option) => P.pipe(option, P.Option_.map(P.string_.toUpperCase))),
  P.TaskEither_.chain((option) =>
    P.pipe(
      option,
      P.Option_.fold((): P.TaskEither<unknown, void> => P.TaskEither_.right(undefined), writeline),
      (x: P.TaskEither<unknown, void>) => x
    )
  ),
  (x) => x,
  // P.Task_.chainIOK(P.Console_.error)
  // P.Task_.chain(P.Either_.fold(P.Task_.fromIOK(P.Console_.error), P.Task_.of))
  P.TaskEither_.getOrElse(P.Task_.fromIOK(P.Console_.error))
  // P.Task_.chain((either) =>
  //   P.pipe(
  //     either,
  //     P.Either_.fold(
  //       (l) => P.Task_.fromIO(P.Console_.error(l)),
  //       (r) => P.Task_.of(r)
  //     )
  //   )
  // )
);

main();
