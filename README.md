# Container Vision / SIAMAC

Site institucional e demonstração em HTML, CSS e JavaScript puros. A marca da SIAMAC é o arquivo original fornecido pelo usuário. Container Vision permanece como nome provisório do produto.

## Site publicado

https://jobvictorfern-cmd.github.io/container-vision-siamac/

O GitHub Pages publica automaticamente os arquivos da raiz da branch main. Para atualizar o site, envie um novo commit para essa branch.

## Executar e hospedar

Abra `index.html` no navegador. Para publicar, envie os arquivos da raiz a uma hospedagem estática. Não há instalação, framework ou build. Imagens e fontes são locais.

## Direção visual

- Azul SIAMAC `#07558b`, azul profundo `#102334`, branco e grafite.
- Montserrat em títulos, textos, menus e dados, conforme as declarações de tipografia do site oficial https://siamac.com.br/, verificadas em 22/10/2026. Fontes locais e licença SIL OFL em `assets/`.
- Cabeçalho com a logo original, ficha técnica em linhas, demonstração com imagem de origem e contato comercial.
- Texto concentrado na identificação do contêiner, tamanho e tipo, conferência visual e demonstração.
- Textos de apoio com 17–18 px, controles com 16–17 px e metadados ampliados. A hierarquia se adapta às telas menores sem reduzir os textos de uso a tamanhos mínimos.

## Animação

`scroll-scene.js` controla a passagem de um caminhão carregado e o giro do contêiner pela rolagem nativa. O movimento é reversível; os controles inferiores permitem saltar entre Transporte, Contêiner e Identificação.

A abertura mostra um caminhão branco com contêiner laranja, em imagem fotorrealista com transparência. As três rodas giram de acordo com a distância percorrida e revertem o sentido ao voltar a rolagem. O contêiner é uma camada independente desde o primeiro quadro, alinhada à carroceria e com a textura da própria imagem do caminhão.

Ao rolar, a carroceria continua para a esquerda enquanto a carga desacelera e ganha destaque. Seus vértices passam de uma vista lateral para o volume tridimensional; não há desaparecimento da carga nem entrada de um segundo contêiner. A partir daí, o giro continua até a porta frontal, com o mesmo enquadramento e os mesmos dados da sequência anterior.

O contêiner é um volume com geometria 3D: lateral, teto e portas compartilham os mesmos vértices. A câmera projeta a rotação no eixo vertical, reduz a inclinação e aproxima o conjunto até a vista frontal. As texturas acompanham cada face por homografia, sem separar a porta do restante do contêiner. A mesma imagem das portas é usada do início ao fim e coincide com o enquadramento final da interface.

A cena usa as margens reais do cabeçalho para enquadrar o caminhão na abertura e o contêiner durante o giro. A escala inicial respeita o texto e a altura disponível; quando o texto desaparece, o caminhão ganha destaque antes de sair. Uma sombra suave acompanha o veículo.

No celular, o caminhão é dimensionado para o espaço abaixo do texto. A câmera acompanha o centro do volume e limita a largura para manter o contêiner inteiro na tela durante o giro. Os dados aparecem ao concluir a rotação. O amortecimento independe da taxa de atualização e o Canvas só redesenha durante movimento ou redimensionamento. O modo de movimento reduzido exibe etapas fixas.

Veja `ART-DIRECTION.md` para origem dos assets e prompts. As texturas e o equipamento são composições fotorrealistas geradas, não registros reais de uma instalação. O giro do contêiner segue um percurso definido pela rolagem.

## Demonstração

`script.js` apresenta a demonstração em duas etapas visíveis: imagem do contêiner e dados identificados. O número completo fica em destaque, e a marcação 22G1 é traduzida como 20 pés e carga geral. Essa interpretação segue a referência do BIC em https://www.bic-code.org/size-type-code/.

O botão “Ver leitura de exemplo” reproduz uma aproximação da identificação e destaca os dados predefinidos. No celular, a navegação acompanha imagem e resultado; a pessoa pode interromper esse deslocamento rolando para outra parte. Os botões de ampliação mostram a porta inteira, o número ou a marcação de tipo. “Localizar o número na imagem” retorna à região correspondente.

“Baixar registro de exemplo” gera um arquivo de texto legível, com número, tamanho, tipo e indicação de que os dados são ilustrativos. A conferência de outro número fica em uma seção opcional e verifica formato e dígito ISO 6346 sem alterar os dados associados à imagem. Não comprova cadastro ou propriedade.

A página não executa OCR, não conecta câmeras e não possui backend. Imagem, texto e arquivo baixado identificam o conteúdo como exemplo.

Para integrar, substitua o temporizador de `#capture-button` pela chamada à API real. Credenciais devem permanecer no backend.

## Contato comercial

WhatsApp, telefone e e-mail conferidos no site oficial https://siamac.com.br/ em 22/10/2026:

- WhatsApp / telefone: +55 11 91851-2948
- E-mail: vendas@siamac.com.br

Os botões apenas abrem o canal escolhido pelo visitante; nenhuma mensagem é enviada automaticamente.

## Referências

- SIAMAC: https://siamac.com.br/
- Referência visual inicial: https://www.instagram.com/reel/Deu21h-B18R/
- Identificação ISO 6346: https://www.bic-code.org/identification-number/
- Dígito verificador: https://www.bic-code.org/check-digit-calculator/
