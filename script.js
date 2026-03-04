// o usuario escolhe o titulo do dashboard
function definirTitulo() {
    let tituloDigitado = document.getElementById("inputTitulo").value;
    let titulo = document.getElementById("tituloDashboard");

    if (tituloDigitado.trim() !== "") {
        titulo.textContent = tituloDigitado;
    } else {
        alert("Digite um nome válido para o dashboard!");
    }
}


document.addEventListener("DOMContentLoaded", function(){
    console.log("dom está carregado")

    document.getElementById("upload")
        .addEventListener("change", function(e){
            console.log("arquivo selecionado")
        lerArquivo(e);
        });
        
});

let grafico;

//modificando a função de ler arquivo para que ela possa identificar a linha do cabeçalho e "aceitar" linhas em branco ou vazias
function lerArquivo(event){
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e){
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type:"array"});
        const sheet = workbook.Sheets[workbook.SheetNames[0]];

        const dadosBrutos = XLSX.utils.sheet_to_json(sheet, {
            header: 1,      // retorna como matriz
            defval: "",     // para preencher celulas vazias no arquivo com ""
            blankrows: false // para aceitar linhas em branco
        });

        const dadosTratados = detectarCabecalho(dadosBrutos);
        gerarDashboard(dadosTratados);
    }

    reader.readAsArrayBuffer(file);
}

//função para detectar cabeçalho
function detectarCabecalho(dados){
    

    let linhaCabecalhoIndex = 0;

    // tenta achar primeira linha com mais de 2 colunas preenchidas
    for(let i = 0; i < dados.length; i++){
        const preenchidas = dados[i].filter(cel => cel !== "").length;

        if(preenchidas > 2){
            linhaCabecalhoIndex = i;
            break;
        }
    }

    const cabecalho = dados[linhaCabecalhoIndex];
    const resultado = [];

    for(let i = linhaCabecalhoIndex + 1; i < dados.length; i++){

        const obj = {};

        cabecalho.forEach((coluna, index)=>{
            obj[coluna || `Coluna_${index}`] = dados[i][index];
        });

        resultado.push(obj);
    }

    return resultado;
}

function gerarDashboard(dados){
    console.log("Dados recebidos:", dados);

    if(!dados.length){
        alert("Planilha vazia!");
        return;
    }

    const colunas = Object.keys(dados[0]);
    criarSeletores(colunas, dados);
}

function criarSeletores(colunas, dados){

    const container = document.getElementById("configuracao");

    container.innerHTML = `
        <h3>Configurar Dashboard</h3>
        <label>Agrupar por:</label>
        <select id="colunaGrupo"></select>

        <label>Somar coluna:</label>
        <select id="colunaValor"></select>

        <button id="gerarBtn">Gerar</button>
    `;

    const selectGrupo = document.getElementById("colunaGrupo");
    const selectValor = document.getElementById("colunaValor");

    colunas.forEach(coluna=>{
        selectGrupo.innerHTML += `<option value="${coluna}">${coluna}</option>`;
        selectValor.innerHTML += `<option value="${coluna}">${coluna}</option>`;
    });

    document.getElementById("gerarBtn").addEventListener("click", ()=>{
        processarDados(dados);
    });
}

function processarDados(dados){

    const grupo = document.getElementById("colunaGrupo").value;
    const valor = document.getElementById("colunaValor").value;

    let total = 0;
    let agrupado = {};

    dados.forEach(item=>{
         
        const numero = limparNumero(item[valor]); //esta mudança vai servir para que o sistema aceite caracteres especiais dentro das planilhas

        if(!isNaN(numero)){
            total += numero;

            if(agrupado[item[grupo]]){
                agrupado[item[grupo]] += numero;
            }else{
                agrupado[item[grupo]] = numero;
            }
        }
    });

    document.getElementById("totalVendas").innerText =
        "R$ " + total.toLocaleString("pt-BR");

    criarGrafico(agrupado);
}

//função para aceitar caracteres especiais que costumam aparecer no excel 
function limparNumero(valor){

    if(valor === null || valor === undefined) return 0;

    return Number(
        String(valor)
            .replace("R$", "")
            .replace("%", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim()
    );
} //agora o sistema aceita planilhas que contenham "%", ",", ".", "R$"


//fiz para o código mostrar só colunas numéricas no select da soma
const colunasNumericas = colunas.filter(coluna=>{
    return dados.some(item => !isNaN(limparNumero(item[coluna])));
});


function criarGrafico(produtos){

    const labels = Object.keys(produtos);
    const valores = Object.values(produtos);

    if(grafico){
        grafico.destroy();
    }

    grafico = new Chart(document.getElementById("grafico"),{
        type:"bar",
        data:{
            labels:labels,
            datasets:[{
                label:"Resultado",
                data:valores
            }]
        },
        options:{
            responsive:true
        }
    });
}
