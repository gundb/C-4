/* Basic game mechanics for a collaborative connect four like game
   there is a single person, console-playable version at
   http://jsbin.com/wipepi/edit?js,console,output
*/

/***************************** 
  actual game mechanics 
*****************************/
var row = 6, col = 7, board = {}, turn = 'A', victor, localPlay = true, lastPlacement;
function keyStr (r, c) { return (r.toString() + c.toString()); }

function buildBoard() {
  var r = row, c = col, key='';
  while (c) {
    while (r) {
      key = keyStr(r, c);
      board[key] = ' ';
      r -=1;
    }
    r = row; c -= 1;
  }
}

function showBoard() {
  board = board || {};
  var p = ("\n_______________\n");
  for(var key in board) {
    board[key] = board[key] || ' ';
    p += ('|' + board[key]);
    if (key[1] >= col) {
      p += ('|\n---------------\n');
    }
  }
  console.log(p);
}

function turnCheck(team) {
  if (turn != team) {
    console.log(turn + "'s turn");
    return false;
  } else {
    return true;
  }
}

function placeCheck(placementRow) {
  if (placementRow > 7) { console.log('Too high'); return false; }
  if (placementRow < 0) { console.log('Too low'); return false; }
  if (typeof placementRow !== "number" || placementRow % 1 > 0) {
    console.log('Not an int'); return false;
  }
  return true;
}

function place(team, placementRow) {
  var c = col, key;
  if (!placeCheck(placementRow)) {
    console.log("Must place again");
    return false; 
  }
  while ((turn === team) && c && c <= col) {
    key = keyStr(c, placementRow);
    if (board[key] === ' ') {
      board[key] = team;
      lastPlacement = key;
      if (localPlay) {
        return isWin(team, maxDistance(team, key) > 3); 
      }
    }
    c -= 1;
  }
  return false;
}

function maxDistance(team, key) {
  var checkR, checkC, checkKey, diff = 0, max = 0,
      point0, point1;
  var dirs = [[[-1, 0], [1, 0]],
              [[0, -1], [0, 1]],
              [[-1, -1], [1, 1]],
              [[-1, 1], [1, -1]]];
  
  // move out in each direction
  dirs.forEach( function(current, index, arr) {
    current.forEach ( function(c, i, a) {
      dirs[index][i][2] = lengthCheck(team, key, c[0], c[1]);
    });
  });
  
  // measure each directional difference
  dirs.forEach( function(current, index, arr) {
    point0 = (current[0][2]).toString();
    point1 = (current[1][2]).toString();
    diffCol = Math.abs(point0[0] - point1[0]);
    diffRow = Math.abs(point0[1] - point1[1]);
    max = (diffCol > max) ? diffCol : max;
    max = diffRow > max ? diffRow : max;
  });
  return (max + 1);
}

// determine the match that is the maximum distance in a given direction
function lengthCheck(team, key, c, r) {
  max = key;
  do {
    checkKey = keyStr(parseInt(max[0]) + c, parseInt(max[1]) + r);
    if (board[checkKey] === team) {
      max = checkKey;
      flag = true;
    } else { flag = false; }
  } while (flag);    
  return max;   
}

function isWin(team, win) {
  win = win || false;
  if (!win) {
    showBoard();
    return false;
  } else {
    showBoard();
    console.log(team + " wins!");
    (window.updates || function() {})();
    buildBoard();
    return team;
  }
}

function play(team, placementRow) {
  if (Object.getOwnPropertyNames(board).length === 0) {  
    buildBoard (); 
  }
  if (!turnCheck(team)) { return; }
  var isWon = place(team, placementRow);
  turn = (turn == 'A') ? 'B' : 'A';
  return isWon;
}


/***************************** 
  two person game play
*****************************/

function console4 () {
  var winner;
  var loopProtection = 42;
  while (loopProtection) {
    // noprotect
    if (play('A', prompt("A's turn. Which column?"))) { break; }
    if (play('B', prompt("B's turn. Which column?"))) { break; }
    loopProtection -= 1;
  }
  console.log('GAME OVER!');
}

//console4();


/***************************** 
  team game play
*****************************/

function tallyVotes(votes) {
  var votesObj = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0 };
  var maxVal = 0, maxVotes = 0, tieFlag = false, self;
  votes.forEach(function (current, index, array) {
    votesObj[current] += 1;
  });
  for (var obj in votesObj) {
    if (maxVotes > votesObj[obj]) {
    } else if ( maxVotes == votesObj[obj] ) { 
      tieFlag = 'tie';
    } else { 
      tieFlag = false; 
      maxVal = obj;
      maxVotes = votesObj[obj];
    }
  }
  self = tieFlag ? tieFlag : maxVal;
  return self;
}

function teamPlay(team, votes) {
  var teamVote = tallyVotes(votes);
  if (teamVote == 'tie' || !teamVote) {
    console.log(teamVote + " : Must vote again");
    return 'tie'; 
  } else {
    return play(team, parseInt(teamVote));
  }
}

var teamVotes = {'A': {votes: {}, memberCount: 5}, 
                 'B': {votes: {}, memberCount: 0}};
                              
function teamVoting(id, team, vote, members) {
  if (!team) { return 'MUST HAVE A TEAM AFFILIATION'; }
  if (!vote) { return 'MUST HAVE A MEMBER VOTE'; }
  members = members || teamVotes[team].memberCount;
  
  teamVotes[team].votes[id] = vote;
  
  if ((members/2) < Object.keys(teamVotes[team].votes).length) { 
    console.log('playing ...');
    var votes = [];
    for (var voter in teamVotes[team].votes) {
      votes.push(teamVotes[team].votes[voter]);
    }
    teamPlay(team, votes);
    teamVotes[team].votes = {};
  } else {
    console.log('not enough votes yet; standing by');
  }
}


/***************************** 
  testing mechanics
*****************************/

// hor = {11: " ",12: " ",13: " ",14: " ",15: " ",16: " ",17: " ",
//        21: " ",22: " ",23: " ",24: " ",25: " ",26: " ",27: " ",
//        31: " ",32: " ",33: " ",34: " ",35: " ",36: " ",37: " ",
//        41: " ",42: " ",43: " ",44: " ",45: " ",46: " ",47: " ",
//        51: "A",52: " ",53: "B",54: "B",55: " ",56: " ",57: " ",
//        61: "B",62: " ",63: "A",64: "A",65: "A",66: "B",67: " "};

// ver = {11: " ",12: " ",13: " ",14: " ",15: " ",16: " ",17: " ",
//        21: " ",22: " ",23: " ",24: " ",25: " ",26: " ",27: " ",
//        31: " ",32: " ",33: " ",34: " ",35: " ",36: " ",37: " ",
//        41: " ",42: "A",43: "B",44: " ",45: " ",46: " ",47: " ",
//        51: "A",52: "A",53: "B",54: "B",55: " ",56: " ",57: " ",
//        61: "B",62: "A",63: "B",64: "A",65: "A",66: "B",67: " "};

// pos = {11: " ",12: " ",13: " ",14: " ",15: " ",16: " ",17: " ",
//        21: " ",22: " ",23: " ",24: " ",25: " ",26: " ",27: " ",
//        31: " ",32: " ",33: " ",34: " ",35: " ",36: " ",37: " ",
//        41: " ",42: "B",43: "A",44: " ",45: " ",46: " ",47: " ",
//        51: "A",52: "B",53: "B",54: "A",55: " ",56: " ",57: " ",
//        61: "B",62: "A",63: "A",64: "A",65: "A",66: "B",67: " "};

// neg = {11: " ",12: " ",13: " ",14: " ",15: " ",16: " ",17: " ",
//        21: " ",22: " ",23: " ",24: " ",25: " ",26: " ",27: " ",
//        31: " ",32: " ",33: " ",34: "A",35: " ",36: " ",37: " ",
//        41: " ",42: " ",43: "A",44: "B",45: " ",46: " ",47: " ",
//        51: "A",52: " ",53: "B",54: "B",55: "B",56: " ",57: " ",
//        61: "A",62: "A",63: "A",64: "A",65: "A",66: "B",67: " "};

// board = hor;
// showBoard();
// play('A', 2);

// board = ver;
// showBoard();
// play('B', 3);

// board = pos;
// showBoard();
// play('A', 2);

// board = neg;
// showBoard();
// play('B', 3);

/* vertical A */
// play('A', 2);
// play('B', 3);
// play('A', 2);
// play('B', 3);
// play('A', 2);
// play('B', 3);
// play('A', 2);
// play('B', 3);

/* diagonal B */
// play('A', 2);
// play('B', 1);
// play('A', 3);
// play('B', 2);
// play('A', 3);
// play('B', 3);
// play('A', 4);
// play('B', 4);
// play('A', 4);
// play('B', 4); 




// console.log(teamPlay('A', [1,3,4,5,7])); // tie
// console.log(teamPlay('B', [3,3,4,5,5])); // tie
// console.log(teamPlay('A', [3,4,4,4,5])); // 4
// console.log(teamPlay('B', [3,4,4,5])); // 4
// console.log(teamPlay('A', [4,4,5,5])); // tie


// console.log(teamVoting(42, 'A', 4, 5));
// console.log(teamVoting(42, 'A', 4, 4));
// teamVotes.A.votes = {10: 1, 20: 2, 30: 3};
// console.log(teamVoting(42, 'A', 3));


// buildBoard();
// console.log(teamVoting(42, 'A', 1, 1));
// console.log(teamVoting(42, 'B', 1, 1));
// console.log(teamVoting(42, 'A', 2, 1));
// console.log(teamVoting(42, 'B', 1, 1));
// console.log(teamVoting(42, 'A', 3, 1));
// console.log(teamVoting(42, 'B', 1, 1));
// console.log(teamVoting(42, 'A', 4, 1));
// console.log(teamVoting(42, 'B', 1, 1));
// console.log(teamVoting(42, 'A', 5, 1));
// console.log(teamVoting(42, 'B', 1, 1));
// console.log(teamVoting(42, 'A', 6, 1));
// console.log(teamVoting(42, 'B', 1, 1));
// console.log(teamVoting(42, 'A', 7, 1));


















