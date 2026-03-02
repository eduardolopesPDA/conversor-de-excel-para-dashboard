document.addEventListener("DOMContentLoaded", function(){

    document.getElementById("upload")
        .addEventListener("change", lerArquivo);

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
            defval: "",     // para "aceitar" linhas em branco
            blankrows: false
        });

        const dadosTratados = detectarCabecalho(dadosBrutos);
        gerarDashboard(dadosTratados);
    }

    reader.readAsArrayBuffer(file);
}

function gerarDashboard(dados){

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

        const numero = Number(item[valor]);

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