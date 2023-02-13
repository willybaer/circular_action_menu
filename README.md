# Vanillay JS Circular Action Menu

You always wanted a circualr action menu for your web application? I created one for you in vanilla js. You just need to copy the "circularActionMenu.js" file into your existing project.

Here is a small How-To on how you can use the action menu in your own project.

## Setup
The CircualActionMenu class requires a canvas element where the drawing process happens. So first add a canvas element to your html and then fetch the reference of the canvas element, so you can pass it to the CircularActionMenu class.

```
const toggleMenu = () => {
  menu.withTargetElement(element).toggle();
}

const targetClickElement = document.querySelector('#test');
const canvas = document.querySelector('canvas');

let menu = new CircularActionMenu([
  { src: 'first.svg', color: '#757575' },
  { src: 'second.svg', color: '#2196f3' },
  { src: 'third.svg', color: '#757575' },
], 20, canvas)
  .withClickListener((index) => console.log(index));
```

### Action Menu buttons arrangement

Just change the start and end angle to modify the buttons arrangement within the 360° circle. The arrangement happens clockwise where 0° is the right horizontal position.

![alt text](https://github.com/willybaer/circular_action_menu/blob/main/example.png?raw=true)
