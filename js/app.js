let grafico;

document.getElementById("upload").addEventListener("change", lerArquivo);

function lerArquivo(event){
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e){
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type:"array"});
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);

        gerarDashboard(json);
    }

    reader.readAsArrayBuffer(file);
}

function gerarDashboard(dados){

    if(!dados.length){
        alert("Planilha vazia!");
        return;
    }

    // Espera que sua planilha tenha colunas:
    // "Produto" e "Valor"

    let total = 0;
    let produtos = {};
    
    dados.forEach(item=>{
        total += Number(item.Valor);

        if(produtos[item.Produto]){
            produtos[item.Produto] += Number(item.Valor);
        }else{
            produtos[item.Produto] = Number(item.Valor);
        }
    });

    document.getElementById("totalVendas").innerText = 
        "R$ " + total.toLocaleString("pt-BR");

    document.getElementById("qtdRegistros").innerText = dados.length;

    criarGrafico(produtos);
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
                label:"Vendas por Produto",
                data:valores
            }]
        },
        options:{
            responsive:true
        }
    });
}