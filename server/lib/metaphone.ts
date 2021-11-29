/*
This function is copied from the original source code of the natural library
just to reduce file size as natural library is a very big library containing all the language related functions.
*/

/*
Copyright (c) 2011, Chris Umbel
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

function dedup(token: string) {
  return token.replace(/([^c])\1/g, "$1");
}

function dropInitialLetters(token: string) {
  if (token.match(/^(kn|gn|pn|ae|wr)/)) {
    return token.substr(1, token.length - 1);
  }

  return token;
}

function dropBafterMAtEnd(token: string) {
  return token.replace(/mb$/, "m");
}

function cTransform(token: string) {
  token = token.replace(/([^s]|^)(c)(h)/g, "$1x$3").trim();

  token = token.replace(/cia/g, "xia");
  token = token.replace(/c(i|e|y)/g, "s$1");
  token = token.replace(/c/g, "k");

  return token;
}

function dTransform(token: string) {
  token = token.replace(/d(ge|gy|gi)/g, "j$1");
  token = token.replace(/d/g, "t");

  return token;
}

function dropG(token: string) {
  token = token.replace(/gh(^$|[^aeiou])/g, "h$1");
  token = token.replace(/g(n|ned)$/g, "$1");

  return token;
}

function transformG(token: string) {
  token = token.replace(/gh/g, "f");
  token = token.replace(/([^g]|^)(g)(i|e|y)/g, "$1j$3");
  token = token.replace(/gg/g, "g");
  token = token.replace(/g/g, "k");

  return token;
}

function dropH(token: string) {
  return token.replace(/([aeiou])h([^aeiou]|$)/g, "$1$2");
}

function transformCK(token: string) {
  return token.replace(/ck/g, "k");
}
function transformPH(token: string) {
  return token.replace(/ph/g, "f");
}

function transformQ(token: string) {
  return token.replace(/q/g, "k");
}

function transformS(token: string) {
  return token.replace(/s(h|io|ia)/g, "x$1");
}

function transformT(token: string) {
  token = token.replace(/t(ia|io)/g, "x$1");
  token = token.replace(/th/, "0");

  return token;
}

function dropT(token: string) {
  return token.replace(/tch/g, "ch");
}

function transformV(token: string) {
  return token.replace(/v/g, "f");
}

function transformWH(token: string) {
  return token.replace(/^wh/, "w");
}

function dropW(token: string) {
  return token.replace(/w([^aeiou]|$)/g, "$1");
}

function transformX(token: string) {
  token = token.replace(/^x/, "s");
  token = token.replace(/x/g, "ks");
  return token;
}

function dropY(token: string) {
  return token.replace(/y([^aeiou]|$)/g, "$1");
}

function transformZ(token: string) {
  return token.replace(/z/, "s");
}

function dropVowels(token: string) {
  return (
    token.charAt(0) + token.substr(1, token.length).replace(/[aeiou]/g, "")
  );
}

const metaphone = function (token: string, maxLength?: number) {
  token = token.toLowerCase();
  token = dedup(token);
  token = dropInitialLetters(token);
  token = dropBafterMAtEnd(token);
  token = transformCK(token);
  token = cTransform(token);
  token = dTransform(token);
  token = dropG(token);
  token = transformG(token);
  token = dropH(token);
  token = transformPH(token);
  token = transformQ(token);
  token = transformS(token);
  token = transformX(token);
  token = transformT(token);
  token = dropT(token);
  token = transformV(token);
  token = transformWH(token);
  token = dropW(token);
  token = dropY(token);
  token = transformZ(token);
  token = dropVowels(token);

  if (maxLength) {
    token = token.toUpperCase();
    if (token.length >= maxLength) {
      token = token.substring(0, maxLength);
    }
  }

  return token.toUpperCase();
};

export { metaphone };
