
// # função usada para otimizar a criação de elementos
function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

// # cria a barreira verificando se é reversa ou não
function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)
    // # altera a altura do corpo da barreira
    this.setAltura = altura => corpo.style.height = `${altura}px`
}

// # Criando o par de barreira
function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')


    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)
    // # adiciona o par de barreiras ao elemento
    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)
    // # função usada para criar a abertura entre as barreiras randomicamente 
    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }
    // # Retorna a posição da abertura
    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    // # Altera a posição da abertura
    this.setX = x => this.elemento.style.left = `${x}px`
    // # Retorna a largura do elemento
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}


// # Controla as barreiras e reaproveita numa especie de carrocel 
function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    // # Posiciona as barreiras na tela
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3),
    ]

    const deslocamento = 3
    // # Função responsavel por iniciar a animação do game
    this.animar = () => {
        // # Faz o deslocamento das barreiras na tela
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // # Calcula se a barreira saiu da tela e reposiciona no final sorteando uma nova abertura
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            // # Verifica se a barreira cruzou o meio e adiciona 1 ponto ao contador
            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio && par.getX() < meio
            if (cruzouOMeio) notificarPonto()
        })
    }

}

// # Criando o passro
function Passaro(alturaJogo) {
    let voando = false
    // # Carrega a arte do passaro
    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'img/passaro.png'
    // # Informa a posição atual do passaro
    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    // # Atualiza a posição do passaro
    this.setY = y => this.elemento.style.bottom = `${y}px`
    // # Captura o evento do teclado alterando a variavel voando
    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false
    // # Anima o passaro segundo o estado voando capturado pelo teclado
    this.animar = () => {
        // # Define a velocidade de Up e Down
        const novoY = this.getY() + (voando ? 8 : -5)
        // # Define a altura maxima que o passaro pode voar
        const alturaMaxima = alturaJogo - this.elemento.clientWidth

        // # Define o limite inferior para que o passaro nao ultrapasse
        if (novoY <= 0){
            this.setY(0)
        } else if (novoY >= alturaMaxima){
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

// # Atualiza o contador
function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

// # Verificando a area das possiveis colisoes 
function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left +a.width >= b.left && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top
    return horizontal && vertical

}

// # Verifica se houve colição entre o passaro e as barreiras
function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior) || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}


// Função responsavel por iniciar o game
function FlappyBird() {
    let pontos = 0
    // # Definindo a area do jogo
    const areaDoJogo = document.querySelector('[wc-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth
    // # Criando os elementos
    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400,() => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)
    // # Adiciona os elementos na tela
    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    // # Iniciando o game
    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start()