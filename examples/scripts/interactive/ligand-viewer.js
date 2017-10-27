
stage.setParameters({
  backgroundColor: 'white'
})

function addElement (el) {
  Object.assign(el.style, {
    position: 'absolute',
    zIndex: 10
  })
  stage.viewer.container.appendChild(el)
}

function createElement (name, properties, style) {
  var el = document.createElement(name)
  Object.assign(el, properties)
  Object.assign(el.style, style)
  return el
}

function createSelect (options, properties, style) {
  var select = createElement('select', properties, style)
  options.forEach(function (d) {
    select.add(createElement('option', {
      value: d[ 0 ], text: d[ 1 ]
    }))
  })
  return select
}

// function createFileButton (label, properties, style) {
//   var input = createElement('input', Object.assign({
//     type: 'file'
//   }, properties), { display: 'none' })
//   addElement(input)
//   var button = createElement('input', {
//     value: label,
//     type: 'button',
//     onclick: function () { input.click() }
//   }, style)
//   return button
// }

var ligandSele = '( not polymer or not ( protein or nucleic ) ) and not ( water or ACE or NH2 )'

var pocketRadius = 0
var pocketRadiusClipFactor = 1

var cartoonRepr, backboneRepr, spacefillRepr, neighborRepr, ligandRepr, contactRepr, pocketRepr, labelRepr

var struc
var neighborSele
var sidechainAttached = false

function loadStructure (input) {
  struc = undefined
  stage.setFocus(0)
  stage.removeAllComponents()
  ligandSelect.innerHTML = ''
  clipNearRange.value = 0
  clipRadiusRange.value = 100
  pocketOpacityRange.value = 0
  cartoonCheckbox.checked = false
  backboneCheckbox.checked = true
  hydrophobicCheckbox.checked = false
  return stage.loadFile(input).then(function (o) {
    struc = o
    setLigandOptions()
    o.autoView()
    cartoonRepr = o.addRepresentation('cartoon', {
      visible: false
    })
    backboneRepr = o.addRepresentation('backbone', {
      visible: true,
      colorValue: 'lightgrey',
      scale: 2
    })
    spacefillRepr = o.addRepresentation('spacefill', {
      sele: ligandSele,
      visible: true
    })
    neighborRepr = o.addRepresentation('ball+stick', {
      sele: 'none',
      aspectRatio: 1.1,
      colorValue: 'white',
      multipleBond: 'symmetric'
    })
    ligandRepr = o.addRepresentation('ball+stick', {
      multipleBond: 'symmetric',
      colorValue: 'grey',
      sele: 'none',
      aspectRatio: 1.2,
      scale: 2.5
    })
    contactRepr = o.addRepresentation('contact', {
      sele: 'none',
      radius: 0.07
    })
    pocketRepr = o.addRepresentation('surface', {
      sele: 'none',
      lazy: true,
      visibility: false,
      clipNear: 0,
      opaqueBack: false,
      opacity: 0.0,
      color: 'hydrophobicity',
      roughness: 1.0,
      surfaceType: 'av'
    })
    labelRepr = o.addRepresentation('label', {
      sele: 'none',
      color: '#333333',
      zOffset: 2.0,
      attachment: 'middle-center',
      showBackground: true,
      backgroundColor: 'white',
      backgroundOpacity: 0.5,
      scale: 0.6
    })
  })
}

function setLigandOptions () {
  ligandSelect.innerHTML = ''
  var options = [['', 'select ligand']]
  struc.structure.eachResidue(function (rp) {
    if (rp.isWater()) return
    var sele = ''
    if (rp.resno !== undefined) sele += rp.resno
    if (rp.inscode) sele += '^' + rp.inscode
    if (rp.chain) sele += ':' + rp.chainname
    var name = (rp.resname ? '[' + rp.resname + ']' : '') + sele
    options.push([sele, name])
  }, new NGL.Selection(ligandSele))
  options.forEach(function (d) {
    ligandSelect.add(createElement('option', {
      value: d[0], text: d[1]
    }))
  })
}

var loadPdbidText = createElement('span', {
  innerText: 'load pdb id'
}, { top: '40px', left: '12px', color: 'lightgrey' })
addElement(loadPdbidText)

var loadPdbidInput = createElement('input', {
  type: 'text',
  title: 'press enter to load pdbid',
  onkeypress: function (e) {
    if (e.keyCode === 13) {
      e.preventDefault()
      loadStructure('rcsb://' + e.target.value)
    }
  }
}, { top: '60px', left: '12px', width: '120px' })
addElement(loadPdbidInput)

function showFull () {
  ligandSelect.value = ''
  backboneCheckbox.checked = true

  backboneRepr.setParameters({ scale: 2 })
  backboneRepr.setVisibility(true)
  spacefillRepr.setVisibility(true)

  ligandRepr.setVisibility(false)
  neighborRepr.setVisibility(false)
  contactRepr.setVisibility(false)
  pocketRepr.setVisibility(false)
  labelRepr.setVisibility(false)

  struc.autoView(2000)
}

var fullButton = createElement('input', {
  value: 'full structure',
  type: 'button',
  onclick: showFull
}, { top: '104px', left: '12px' })
addElement(fullButton)

function showLigand (sele) {
  var s = struc.structure

  var withinSele = s.getAtomSetWithinSelection(new NGL.Selection(sele), 5)
  var withinGroup = s.getAtomSetWithinGroup(withinSele)
  var expandedSele = withinGroup.toSeleString()
  neighborSele = '(' + expandedSele + ') and not (' + sele + ')'

  var sview = s.getView(new NGL.Selection(sele))
  pocketRadius = Math.max(sview.boundingBox.getSize().length() / 2, 2) + 5
  var withinSele2 = s.getAtomSetWithinSelection(new NGL.Selection(sele), pocketRadius + 2)
  var neighborSele2 = '(' + withinSele2.toSeleString() + ') and not (' + sele + ') and polymer'

  backboneRepr.setParameters({ scale: 0.2 })
  spacefillRepr.setVisibility(false)

  ligandRepr.setVisibility(true)
  neighborRepr.setVisibility(true)
  contactRepr.setVisibility(true)
  pocketRepr.setVisibility(pocketOpacityRange.value > 0)
  labelRepr.setVisibility(labelCheckbox.checked)

  ligandRepr.setSelection(sele)
  neighborRepr.setSelection(
    sidechainAttached ? '(' + neighborSele + ') and (sidechainAttached or not polymer)' : neighborSele
  )
  contactRepr.setSelection(expandedSele)
  pocketRepr.setSelection(neighborSele2)
  pocketRepr.setParameters({
    clipRadius: pocketRadius * pocketRadiusClipFactor,
    clipCenter: sview.center
  })
  labelRepr.setSelection('(' + neighborSele + ') and .CA')

  struc.autoView(expandedSele, 2000)
}

var ligandSelect = createSelect([], {
  onchange: function (e) {
    var sele = e.target.value
    if (!sele) {
      showFull()
    } else {
      showLigand(sele)
    }
  }
}, { top: '134px', left: '12px' })
addElement(ligandSelect)

addElement(createElement('span', {
  innerText: 'pocket near clipping'
}, { top: '164px', left: '12px', color: 'lightgrey' }))
var clipNearRange = createElement('input', {
  type: 'range', value: 0, min: 0, max: 10000, step: 1
}, { top: '180px', left: '12px' })
clipNearRange.oninput = function (e) {
  var sceneRadius = stage.viewer.boundingBox.getSize().length() / 2

  var f = pocketRadius / sceneRadius
  var v = parseFloat(e.target.value) / 10000  // must be between 0 and 1
  var c = 0.5 - f / 2 + v * f

  pocketRepr.setParameters({
    clipNear: c * 100  // must be between 0 and 100
  })
}
addElement(clipNearRange)

addElement(createElement('span', {
  innerText: 'pocket radius clipping'
}, { top: '210px', left: '12px', color: 'lightgrey' }))
var clipRadiusRange = createElement('input', {
  type: 'range', value: 100, min: 1, max: 100, step: 1
}, { top: '226px', left: '12px' })
clipRadiusRange.oninput = function (e) {
  pocketRadiusClipFactor = parseFloat(e.target.value) / 100
  pocketRepr.setParameters({ clipRadius: pocketRadius * pocketRadiusClipFactor })
}
addElement(clipRadiusRange)

addElement(createElement('span', {
  innerText: 'pocket opacity'
}, { top: '256px', left: '12px', color: 'lightgrey' }))
var pocketOpacityRange = createElement('input', {
  type: 'range', value: 90, min: 0, max: 100, step: 1
}, { top: '272px', left: '12px' })
pocketOpacityRange.oninput = function (e) {
  var v = parseFloat(e.target.value)
  pocketRepr.setVisibility(v > 0)
  pocketRepr.setParameters({
    opacity: v / 100
  })
}
addElement(pocketOpacityRange)

var cartoonCheckbox = createElement('input', {
  type: 'checkbox',
  checked: false,
  onchange: function (e) {
    cartoonRepr.setVisibility(e.target.checked)
  }
}, { top: '302px', left: '12px' })
addElement(cartoonCheckbox)
addElement(createElement('span', {
  innerText: 'cartoon'
}, { top: '302px', left: '32px', color: 'lightgrey' }))

var backboneCheckbox = createElement('input', {
  type: 'checkbox',
  checked: true,
  onchange: function (e) {
    backboneRepr.setVisibility(e.target.checked)
  }
}, { top: '322px', left: '12px' })
addElement(backboneCheckbox)
addElement(createElement('span', {
  innerText: 'backbone'
}, { top: '322px', left: '32px', color: 'lightgrey' }))

var sidechainAttachedCheckbox = createElement('input', {
  type: 'checkbox',
  checked: false,
  onchange: function (e) {
    sidechainAttached = e.target.checked
    neighborRepr.setSelection(
      sidechainAttached ? '(' + neighborSele + ') and (sidechainAttached or not polymer)' : neighborSele
    )
  }
}, { top: '342px', left: '12px' })
addElement(sidechainAttachedCheckbox)
addElement(createElement('span', {
  innerText: 'sidechainAttached'
}, { top: '342px', left: '32px', color: 'lightgrey' }))

var labelCheckbox = createElement('input', {
  type: 'checkbox',
  checked: true,
  onchange: function (e) {
    labelRepr.setVisibility(e.target.checked)
  }
}, { top: '362px', left: '12px' })
addElement(labelCheckbox)
addElement(createElement('span', {
  innerText: 'label'
}, { top: '362px', left: '32px', color: 'lightgrey' }))

var hydrophobicCheckbox = createElement('input', {
  type: 'checkbox',
  checked: false,
  onchange: function (e) {
    contactRepr.setParameters({ hydrophobic: e.target.checked })
  }
}, { top: '382px', left: '12px' })
addElement(hydrophobicCheckbox)
addElement(createElement('span', {
  innerText: 'hydrophobic'
}, { top: '382px', left: '32px', color: 'lightgrey' }))

loadStructure('rcsb://4cup').then(function(){
  showLigand('ZYB')
})