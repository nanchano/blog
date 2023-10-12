---
title: Dynamic Factory Design Pattern in Python
description: Creating dynamic object factories to avoid long if/switch chains
date: "2023-10-12"
tags:
  - python
  - software-architecture
  - design-patterns
published: true
---

The factory pattern might be one of the most common and well known design patterns, and for good reasons. It relies on abstractions while being able to serve clients with concrete implementations of the object they want.

Usually, the pattern relies on `if` or `switch/match` chains to determine the object to return, which can work when there are a limited number of objects, but it presents some problems when scaling, as forgetting to add the condition to the factory ends up creating unexpected side effects.

An alternative is just making a dynamic factory, which sacrificies readability for scalability, while also introducing some conditions in the way the project, modules and objects should be structure or named.

It's especially easy to implement in Python by leveraging the `getattr` function and the `importlib` module, as we can dynamically look for objects in any module we want.

## The Example
We are going to implement music players in different formats: MP3, FLAC, WAV, and whatever comes in the future. Conceptually, these music players must only do one thing: `play` music.

As such, an interface is defined for them

```python
class MusicPlayer(Protocol):
    """Defines the Music Player interface, to be implemented
    by objects that can play music in a format they want."""

    def play(self) -> None:
        """Plays music"""
        ...

```

Before going further, lets have a quick word on interfaces. There are two traditional ways to do it:
1. Explicitely, where an Abstract Base Class is defined, and subclasses are made with it, having to implement the abstract methods themselves.
2. Implicitely, through Protocols, on which no inheritance is used, and the interface implementation is not enforced.

This is my preferred choice as it reduces the amount of boiler plate and imports, but it might be my `Go` bias, as the interfaces there are also implicit. That said,as Python is a dynamic language, there's no real pre runtime check on the implementation conforming to the interface, so if the method is called and it is not implemented, it will break.

To make sure we instantiate the right player based on the type of files our music contains, we are going to use the factory pattern, and make it dynamic.

The folder structure for all the examples is the same, and it can be a bit tight, as we need to conform to some kind of norm for the pattern to work. In this case, all the music players will be housed in the `players` module, and the submodule name will be the player name (think `mp3`, `flac`, etc.). Furthermore, the object will conform to the same conventions, with the name being uppercase and the `Player` suffix (like `MP3Player`, for example).

```
├── README.md
├── basic
│   ├── main.py
│   └── players
│       ├── __init__.py
│       ├── flac.py
│       ├── mp3.py
│       └── wav.py
├── configurable
│   ├── main.py
│   └── players
│       ├── __init__.py
│       ├── flac.py
│       ├── mp3.py
│       └── wav.py
└── functional
    ├── main.py
    └── players
        ├── __init__.py
        ├── flac.py
        ├── mp3.py
        └── wav.py
```

I prefer the interfaces defined on the client side, that is, wherever the objects will be called, rather than where the objects are defined, as this leads to a decoupled architecture.

We are going to explore three options:
1. A basic one, where all the players are instantiated in the same way.
2. A more advanced one, where players have different state, and require a different way of initialization.
3. A functional alternative.

To see the full code for each case, head to the GitHub [repo](https://www.github.com/nanchano/dynamic-factory-pattern).

## Basic

The basic pattern consists on just instantiating the objects in the same way. The classes require no initializationa rguments, and have no state.

Here, a typical player looks like this:

```python
class RandomPlayer:
    def play(self) -> None:
        print("Playing Random player")

```

As such, the factory is quite simple in the way it can initialize any kind of player without arguments.

```python
class MusicPlayerFactory:
    """Dynamic factory that creates MusicPlayers. It automatically looks for the
    right MusicPlayer in the `players` module given the potential name of it."""

    def __init__(self, name: str) -> None:
        """Initializes the class, parsing the given name.
        Args:
            name (str): service name."""
        self.module_name = "players." + name.lower().strip()
        player_name = name.upper()
        self.player_name = player_name + "Player"

    def get_music_player(self) -> MusicPlayer:
        """Finds the right Music Player to create.
        Returns:
            initialized music player (MusicPlayer)
        Raises:
            ModuleNotFoundError | AttributeError"""
        try:
            player = getattr(
                importlib.import_module(self.module_name), self.player_name
            )
        except ModuleNotFoundError:
            print(f"Module {self.module_name} does not exist.")
            raise
        except AttributeError:
            print(f"Music Player {self.player_name} has not been implemented yet.")
            raise

        print(f"Initializing {self.player_name}")
        return player()
```

The factory when intiialized parses the given `name` to define the module name where the music player is housed, as well as the player name to be instantiated.

the `get_music_player` method just looks for the player to spawn based on that, using the `importlib` module. If all is right, the instantiated player will be returned.

In practice, we pass the factory something like `mp3`, which in turn, by string parsing, will search for `MP3Player` inside the `players.mp3` submodule.

## Configurable
In this case, the player have different way of initializing them, and they use their own attributes in the `play` method as a way of configuration.  A real world example of this could be some form of authentication or special business logic.

Delegating each player's own unique features to the init is a clean way of maintaining the interface implementation, as the `play` method signature stays the same. That said, this pretty much locks you into the traditional OOP design pattern, unless you'd prefer to use `partials` on a functional example, at the expense of readability.

```python
class MP3Player:
    def __init__(self, api_key: str) -> None:
        self.api_key = api_key

    def play(self) -> None:
        print("Using api_key to authenticate")
        print("Playing MP3")

class FLACPlayer:
    def __init__(self, api_key: str, secret_key: str) -> None:
        self.api_key = api_key
        self.secret_key = secret_key

    def play(self) -> None:
        print("Using api_key and secret_key to authenticate")
        print("Playing FLAC")

class WAVPlayer:
    def __init__(self, user: str, pwd: str) -> None:
        self.user = user
        self.pwd = pwd

    def play(self) -> None:
        print("Using user and pwd to authenticate")
        print("Playing WAV")
```

With this, the factory is slightly more complex, as it needs to handle init arguments to properly instantiate the objects. In this case, we receive them as arguments on the `get_music_player` method, and just unpack them into the player call.

The arguments, in a production environment, would be passed as some form of configuration file, CLI flags (chosen for this example), or the prefered tool of choice.

```python
class MusicPlayerFactory:
    """Dynamic factory that creates MusicPlayers. It automatically looks for the
    right MusicPlayer in the `players` module given the potential name of it."""

    def __init__(self, name: str) -> None:
        """Initializes the class, parsing the given name.
        Args:
            name (str): service name."""
        self.module_name = "players." + name.lower().strip()
        player_name = name.upper()
        self.player_name = player_name + "Player"

    def get_music_player(self, init: dict[str, Any]) -> MusicPlayer:
        """Finds the right Music Player to create.
        Returns:
            initialized music player (MusicPlayer)
        Raises:
            ModuleNotFoundError | AttributeError"""
        try:
            player = getattr(
                importlib.import_module(self.module_name), self.player_name
            )
        except ModuleNotFoundError:
            print(f"Module {self.module_name} does not exist.")
            raise
        except AttributeError:
            print(f"Music Player {self.player_name} has not been implemented yet.")
            raise

        print(f"Initializing {self.player_name}")
        return player(**init)
```

## Functional
The functional approach is slightly simpler, more readable in my opinion, and reduces boiler plate code; but, as mentioned, configuration is limited.

We start by defining a the interface with `type`, recently released with Python 3.12, which is gonna represent the signature of the `play` function, that is, a function that takes no arguments, and returns nothing.

```python
type MusicPlayer = Callable[[], None]
```

The factory is way shorter, as we don't need to do string manipulation to get the player name, as the player, in this case, will just be the `play` function inside the specific submodule (`mp3`, `wav`, etc.). Furthermore, the name is passed directly as a parameter to the function.

```python
def get_music_player(name: str) -> MusicPlayer:
    """Finds the right Music Player to create.
    Returns:
        music player (MusicPlayer)
    Raises:
        ModuleNotFoundError | AttributeError"""
    module_name = "players." + name.lower().strip()

    try:
        play = getattr(importlib.import_module(module_name), "play")
    except ModuleNotFoundError:
        print(f"Module {module_name} does not exist.")
        raise

    print(f"Initializing {name.upper()} player")
    return play
```

The implementations, as mentioned, will follow the same folder structure, with the difference that only a `play` function will be defined, rather than a class implementing a Protocol. For example:

```python
def play() -> None:
    print("Playing MP3")
```

And, to wrap up, the call to the player will be slightly different, as the factory itself returns the uncalled play function, so we spawn it and then call it.

```python
play = get_music_player(name)
play()
```
