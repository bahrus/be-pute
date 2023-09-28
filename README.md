# be-pute


<!-- [![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/be-switched)  -->
[![Playwright Tests](https://github.com/bahrus/be-pute/actions/workflows/CI.yml/badge.svg)](https://github.com/bahrus/be-pute/actions/workflows/CI.yml) 
[![NPM version](https://badge.fury.io/js/be-pute.png)](http://badge.fury.io/js/be-pute)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/be-pute?style=for-the-badge)](https://bundlephobia.com/result?p=be-pute)
<img src="http://img.badgesize.io/https://cdn.jsdelivr.net/npm/be-pute?compression=gzip">

Compute values from other HTML signals via local script tags.

## Example 1a

```html
<div itemscope>
    <link itemprop=isHappy>
    <link itemprop=isWealthy>

    ...

    <script nomodule>
        isHappy && !isWealthy
    </script>
    <link itemprop=isInNirvana be-pute='Value from $isHappy, $isWealthy.'>
</div>
```


## Example 1b

```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...

    <script nomodule>
        isHappy && !isWealthy && liberated.length > 17
    </script>
    <link itemprop=isInNirvana be-pute='Value from $isHappy, @isWealthy, #liberated.'>
</form>
```

## Example 1c

Add more context to the scripting

```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...

    <script nomodule>
        ({isHappy, isWealthy, liberated}) => {
            console.log({isHappy, isWealthy, liberated});
            return isHappy && !isWealthy && liberated.length > 17;
        }
    </script>
    <link itemprop=isInNirvana be-pute='Value from $isHappy, @isWealthy, #liberated.'>
</form>
```

## Example 1d

Values coming from host (/)

```html
<my-custom-element>
    #shadow
        <script nomodule>
            myProp ** 2
        </script>
        <data itemprop=squared be-pute='Value from /myProp.'>
        <be-hive></be-hive>
</my-custom-element>
```

## Example 2a

```html
<form itemscope>
    <link itemprop=isHappy href=https://schema.org/True>
    <input type=checkbox name=isWealthy>
    <div contenteditable id=liberated>abc</div>
    ...

    <script nomodule>
        ({
            prop1: isHappy && !isWealthy && liberated.length > 17,
            prop2: liberated.blink(),
        })
    </script>
    <any-element itemprop=isInNirvana be-pute='Props from $isHappy, @isWealthy, #liberated.'></any-element>
</form>
```

## Viewing Your Element Locally

Any web server that can serve static files will do, but...

1.  Install git.
2.  Fork/clone this repo.
3.  Install node.js.
4.  Open command window to folder where you cloned this repo.
5.  > npm install
6.  > npm run serve
7.  Open http://localhost:3030/demo/ in a modern browser.

## Running Tests

```
> npm run test
```

## Using from ESM Module:

```JavaScript
import 'be-pute/be-pute.js';
```

## Using from CDN:

```html
<script type=module crossorigin=anonymous>
    import 'https://esm.run/be-pute';
</script>
```