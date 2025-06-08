

// Mostrar seção selecionada
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
    
    // Inicializar map se for a seção do mapa
    if (sectionId === 'mapa' && typeof map === 'undefined') {
        initMap();
    }
    
    // Rolar para o topo
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// Inicializar com a seção de monitoramento visível
document.addEventListener("DOMContentLoaded", () => {
    showSection('monitoramento');
    
    // Atualizar estatísticas
    atualizarEstatisticas();
    
    // Carregar lista de podas
    carregarPodas();
    
    // Inicializar gráficos
    inicializarGraficos();
});

// Formulário de relatório
document.getElementById("formRelatorio").addEventListener("submit", function(e) {
    e.preventDefault();
    enviarRelatorio();
});

function enviarRelatorio() {
    let localizacao = document.getElementById("localizacao").value;
    let tipoProblema = document.getElementById("tipoProblema").value;
    
    if (!tipoProblema) {
        mostrarMensagem("Por favor, selecione o tipo de problema.", "danger");
        return;
    }
    
    if (!localizacao) {
        mostrarMensagem("Por favor, informe a localização.", "danger");
        return;
    }
    
    // Simular envio para o servidor
    setTimeout(() => {
        mostrarMensagem("Relatório enviado com sucesso! Obrigado por contribuir com a segurança de Maringá.", "success");
        document.getElementById("formRelatorio").reset();
        atualizarEstatisticas();
    }, 1000);
}

function mostrarMensagem(texto, tipo) {
    const mensagem = document.getElementById("mensagem");
    mensagem.textContent = texto;
    mensagem.className = `alert alert-${tipo}`;
    mensagem.style.display = "block";
    
    setTimeout(() => {
        mensagem.style.display = "none";
    }, 5000);
}

// Mapa Interativo com Leaflet
let map;
let markers = [];

function initMap() {
    map = L.map('map').setView([-23.425, -51.937], 14);
    
    // Adicionar tile layer do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
    }).addTo(map);
    
    // Adicionar alguns marcadores de exemplo
    adicionarMarcador(-23.427, -51.937, "Risco de queda", "red");
    adicionarMarcador(-23.423, -51.935, "Poda agendada", "yellow");
    adicionarMarcador(-23.420, -51.940, "Árvore saudável", "green");
    
    // Configurar pesquisa
    const searchControl = new GeoSearch.GeoSearchControl({
        provider: new GeoSearch.OpenStreetMapProvider(),
        style: 'bar',
        searchLabel: 'Pesquisar local...',
        autoComplete: true,
        autoCompleteDelay: 250,
        showMarker: true,
        marker: {
            icon: new L.Icon.Default(),
            draggable: false,
        },
    });
    
    map.addControl(searchControl);
}

function pesquisarNoMapa() {
    const query = document.getElementById("pesquisaMapa").value;
    if (!query) return;
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                map.setView([lat, lon], 16);
                
                L.marker([lat, lon], {
                    icon: new L.Icon.Default()
                }).addTo(map)
                .bindPopup(query)
                .openPopup();
            } else {
                mostrarMensagem("Localização não encontrada. Tente um endereço mais específico.", "danger");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensagem("Erro ao buscar localização. Tente novamente.", "danger");
        });
}

function adicionarMarcador(lat, lng, titulo, cor) {
    const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: cor,
        color: "#fff",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    }).addTo(map);
    
    marker.bindPopup(titulo);
    markers.push(marker);
}

// Gestão de Podas
function carregarPodas() {
    const cronogramaPodas = [
        { bairro: "Zona 7", data: "10/04/2025", status: "agendada" },
        { bairro: "Centro", data: "15/04/2025", status: "agendada" },
        { bairro: "Jardim Alvorada", data: "20/04/2025", status: "agendada" },
        { bairro: "Zona 5", data: "05/04/2025", status: "concluída" }
    ];
    
    const listaPodas = document.getElementById("listaPodas");
    listaPodas.innerHTML = '';
    
    cronogramaPodas.forEach(poda => {
        let item = document.createElement("li");
        item.className = "list-group-item d-flex justify-content-between align-items-center";
        
        let statusBadge = poda.status === "agendada" ? 
            '<span class="badge bg-warning text-dark">Agendada</span>' : 
            '<span class="badge bg-success">Concluída</span>';
        
        item.innerHTML = `
            <div>
                <strong>${poda.bairro}</strong> - ${poda.data}
            </div>
            ${statusBadge}
        `;
        listaPodas.appendChild(item);
    });
    
    // Formulário de solicitação de poda
    document.getElementById("formPoda").addEventListener("submit", function(e) {
        e.preventDefault();
        
        const local = document.getElementById("localPoda").value;
        const motivo = document.getElementById("motivoPoda").value;
        
        if (!local || !motivo) {
            mostrarMensagem("Por favor, preencha todos os campos.", "danger");
            return;
        }
        
        // Simular envio
        setTimeout(() => {
            mostrarMensagem("Solicitação de poda enviada com sucesso! Você receberá um retorno em breve.", "success");
            document.getElementById("formPoda").reset();
            carregarPodas();
        }, 1000);
    });
}

// Gráficos de Qualidade Ambiental
function inicializarGraficos() {
    // Gráfico de Qualidade do Ar
    let ctxAr = document.getElementById("graficoQualidadeAr").getContext("2d");
    new Chart(ctxAr, {
        type: "bar",
        data: {
            labels: ["Centro", "Zona 7", "Jd. Alvorada", "Zona 5", "Jardim Imperial"],
            datasets: [{
                label: "Qualidade do Ar (%)",
                data: [85, 90, 80, 88, 82],
                backgroundColor: ["#388e3c", "#43a047", "#4caf50", "#66bb6a", "#81c784"],
                borderColor: ["#2e7d32", "#388e3c", "#43a047", "#4caf50", "#66bb6a"],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // Gráfico de Temperatura
    let ctxTemp = document.getElementById("graficoTemperatura").getContext("2d");
    new Chart(ctxTemp, {
        type: "line",
        data: {
            labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"],
            datasets: [{
                label: "Temperatura Média (°C)",
                data: [26, 25.5, 24.8, 23.2, 21.5, 20.8, 20.5],
                borderColor: "#388e3c",
                backgroundColor: "rgba(56, 142, 60, 0.1)",
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true
        }
    });
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    // Simular dados (em um sistema real, isso viria de uma API)
    document.getElementById("co2Reduzido").textContent = "124";
    document.getElementById("arvoresMonitoradas").textContent = "1.857";
    document.getElementById("problemasResolvidos").textContent = "326";
    
    // Animar os números
    animateValue("co2Reduzido", 0, 124, 1000);
    animateValue("arvoresMonitoradas", 0, 1857, 1000);
    animateValue("problemasResolvidos", 0, 326, 1000);
}

function animateValue(id, start, end, duration) {
    let obj = document.getElementById(id);
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        obj.textContent = id === "arvoresMonitoradas" ? value.toLocaleString() : value;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}