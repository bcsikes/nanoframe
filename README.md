# NanoFrame

[![build](https://github.com/sme777/nanoframe/actions/workflows/build.yml/badge.svg)](https://github.com/tilabberkeley/nanoframe/actions/workflows/ci.yml) [![Documentation Status](https://readthedocs.org/projects/nanoframe/badge/?version=latest)](https://nanoframe.readthedocs.io/en/latest/?badge=latest)
[![Test Coverage](https://api.codeclimate.com/v1/badges/a7c3b1796ed55dff5f27/test_coverage)](https://codeclimate.com/github/tilabberkeley/nanoframe/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/a7c3b1796ed55dff5f27/maintainability)](https://codeclimate.com/github/tilabberkeley/nanoframe/maintainability)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

NanoFrame [nanoframe.org](https://www.nanoframe.org) is a web based tool for designing and synthesizing 3D wireframe polyhedra. NanoFrame's [synthesizer](https://www.nanoframe.org/synthesizer) generates polyhedra from single-origami scaffold of any length, which then can be used as building block for designing larger multi-origami structure in NanoFrame's [playground](https://www.nanoframe.org/playground). Save your work to the cloud by creating account at [nanoframe.org](https://www.nanoframe.org).

Consider citing the associated paper if you find the project useful.

> <ins>NanoFrame: A web-based DNA wireframe design tool for 3D structures</ins>.  
> Samson Petrosyan, Grigory Tikhomirov  
> [paper](https://google.com) | [arXiv](https://arxiv.org/abs/2111.13992)

# Contents
- [Control Flow](#control-flow)
- [Home](#home)
- [Synthesizer](#synthesizer)
- [Playground](#playground)
- [Guides](#guides)
- [Suggestions and Reporting Issues](#suggestions-and-reporting-issues)
- [Working Locally](#working-locally)
- [Contributing](#contributing)

# Control Flow

The application is broken down into three parts, each can be navigated to with the ribbon at the top of the page.

<p align="center">
  <img src="https://github.com/sme777/nanoframe/blob/master/docs/navbar.png">
</p>

#### Home

The entry point of [nanoframe.org](https://www.nanoframe.org) is the <ins>Home</ins> tab, where users are taken to a sign in/up page or their profile homepage (depending on cookie sessions); see [Home](#home) for more info. Any user -- whether signed-in or not -- can synthesize polyhedra, the difference lies in saving the work to the cloud. Generated work can be saved as both private and public, further, once users login they can discover what other creators have been synthesizing with NanoFrame.

#### Synthesizer

The NanoBot tab is where all the magic happens. Users can select one of the predefined shapes, or create their own (upcoming feature). After selecting a shape, users can interact with the shape dynamically by adjusting its attributes.

#### Playground

NanoFrame relies on several API which were developed on par with the project. These are completely free, but to make API calls clients need to register and obtain an API key.
In playground tab, user would work with an active canvas and build shapes by dragging and dropping elements on it. Both a graphical user interface (GUI) and a scriptable interface exist for ease of use. As in synthesizer tab, uers will need to be registered to save work from playground, otherwise the service is open to all users.

#### Guides

The guides folder has documentation on all aspects of [nanoframe.org](https://www.nanoframe.org), including video tutorials, file format description, methods and materials, and API docs.

# Home
## Saving Work

All NanoFrame's features are available to any user, but only authenticated users can save their work. Authentication can be done either through signing up with NanoFrame and claiming a username, or through Google/Facebook authentication. Other third-party authentications will be added on demand. In addition, users can also view work of peers that are made public. This will be a feed type of page where users can view, share, and comment on designs generated by others. We also provide the option of saving work in private mode (that is - not visible to anyone but creator).

# Synthesizer
## Shape Picker

In **Nanobot** tab the user gets to choose a shape from given selection or make their own through _custom shape_ to syntheszie a DNA object. We provide interactive display such that the user can have an approximate idea of what the final object will look like. In following pages, more detail is added until the most granual `oxdna` or `pdb` version is generated. Currently only cuboids are supported, but there is active work in regards to other general shapes. Nanobot will give a warning if the selected shape has greater than 200 leftover base pairs and will propt the user to either continue with the current design or check out dimension generator page.

<p align="center">
  <img src="https://github.com/tilabberkeley/nanoframe/blob/master/docs/shape-maker.gif">
</p>
## Visualization

Once you have selected the shape, filled out the parameters, and clicked synthesize, after a brief wait your structure will appear.
*Insert Instruction Video*

When your structure appears, you can change its orientation, zoom in and out, view the staple strands, and view the open form.
*Insert synthesized cube video*

## oxDNA

One of the features of NanoFrame is the level fine grain detail. After selecting and editing DNA routing, atomic level visualization is made available through [oxView](https://sulcgroup.github.io/oxdna-viewer/) which uses the `oxview` file format. To view the atomic level visualization, navigate to your synthesized object, select the download files option then select the oxDNA files. Extract the files. Navigate to [oxView](https://sulcgroup.github.io/oxdna-viewer/) click the black file button (third from left on top) add the 2 extracted files, and view your structure!

*FILE OPEN VIDEO HERE*

<p align="center">
  <img src="https://github.com/tilabberkeley/nanoframe/blob/master/docs/cube.png">
</p>

# Guides

Please refer to our [Guides](https://www.nanoframe.org/guides)

# Suggestions and Reporting Issues

To suggestion or reporting issues in NanoFrame, simply go to [Issues](https://github.com/tilabberkeley/nanoframe/issues) and click on **New Issue**. Provide a title and description. Please write as much detail in description as possible, including the browser and it's version. While NanoFrame is architecture independent, often broswers lag behind in JavaScript and WebGL updates, so simply changing the broswer may resolve the issue. Regardless, still open an issue so the authors are aware of possible bugs.

# Working Locally

Working locally can speed up the process of certain queries. To get started clone this repo to your workspace. You will need to have ruby insatlled for running the next commands. [chruby](https://github.com/postmodern/chruby), [rvm](https://rvm.io/), and [rbenv](https://github.com/rbenv/rbenv) are all great ruby package managers. You will need to have `ruby 3.0.3` to run the app locally. Once you have installed ruby successfully, run `bundle install` in NanoFrame's root directory to install all project dependencies (this might take some time). Then, run `rails s` to boot up the server. Now, navigate to `http://localhost:3000` in your broswer and you should see NanoFrame get activated. Note, that none of you work on production mode (i.e. [nanoframe.org](http://nanoframe.org)) will be avaiable, however you can download the files from the website and upload locally through your homepage.

# Contributions

If you would like to contribute to this project, please <ins>fork</ins> this repository first and make a <ins>pull request</ins> with the branch name of the feature you would like to add. Be sure to check out the [contributions page](https://github.com/tilabberkeley/nanoframe/CONTRIBUTING.md) for further details. We made this project open-source so builders like you can help us provide best quality software to scientists interested in work with DNA nanotechnology. Thank YOU for taking the time to read this far!
