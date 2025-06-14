// Função para mostrar seções
function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Mostrar a seção selecionada
    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.style.display = 'block';
        
        // Inicializar componentes específicos
        if (sectionId === 'mapa' && typeof map === 'undefined') {
            initMap();
        }
        if (sectionId === 'monitoramento') {
            atualizarEstatisticas();
        }
        if (sectionId === 'podas') {
            carregarPodas();
        }
        if (sectionId === 'qualidade') {
            inicializarGraficos();
        }
    }
    
    // Atualizar navegação ativa
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`a[onclick="showSection('${sectionId}');"]`).classList.add('active');
    
    // Rolar para o topo
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// Inicializar a página
document.addEventListener("DOMContentLoaded", function() {
    showSection('monitoramento');
    
    // Evento do formulário de relatório
    document.getElementById("formRelatorio").addEventListener("submit", function(e) {
        e.preventDefault();
        enviarRelatorio();
    });
});

// Funções do formulário de relatório
function enviarRelatorio() {
    const localizacao = document.getElementById("localizacao").value;
    const tipoProblema = document.getElementById("tipoProblema").value;
    
    if (!tipoProblema) {
        mostrarMensagem("Por favor, selecione o tipo de problema.", "danger");
        return;
    }
    
    if (!localizacao) {
        mostrarMensagem("Por favor, informe a localização.", "danger");
        return;
    }
    
    // Simular envio
    setTimeout(() => {
        mostrarMensagem("Relatório enviado com sucesso! Obrigado por contribuir.", "success");
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

// Mapa Interativo
let map;
let markers = [];
let riskLayer;
let scheduledLayer;
let healthyLayer;

function initMap() {
    map = L.map('map').setView([-23.425, -51.937], 14);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
    }).addTo(map);
    
    // Camadas
    riskLayer = L.layerGroup().addTo(map);
    scheduledLayer = L.layerGroup().addTo(map);
    healthyLayer = L.layerGroup().addTo(map);
    
    // Marcadores de exemplo
    adicionarMarcador(-23.427, -51.937, "Risco de queda", "red", "Árvore inclinada na Rua João Paulino Vieira", "Alta", "10/04/2025");
    adicionarMarcador(-23.423, -51.935, "Poda agendada", "yellow", "Poda programada para Avenida Colombo", "Média", "15/04/2025");
    adicionarMarcador(-23.420, -51.940, "Árvore saudável", "green", "Árvore monitorada na Rua Joubert de Carvalho", "Nenhum", "-");
    
    // Controle de camadas
    const overlayMaps = {
        "Áreas de Risco": riskLayer,
        "Podas Agendadas": scheduledLayer,
        "Árvores Saudáveis": healthyLayer
    };
    L.control.layers(null, overlayMaps, {collapsed: false}).addTo(map);
    
    // Controle de pesquisa
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

function adicionarMarcador(lat, lng, tipo, cor, descricao, severidade, dataResolucao) {
    const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${cor}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white"></div>`,
        iconSize: [24, 24]
    });
    
    const marker = L.marker([lat, lng], {icon: icon});
    
    if (cor === 'red' || cor === 'orange') {
        marker.addTo(riskLayer);
    } else if (cor === 'yellow') {
        marker.addTo(scheduledLayer);
    } else {
        marker.addTo(healthyLayer);
    }
    
    const popupContent = `
        <div style="min-width: 200px">
            <h5 style="margin: 0 0 10px 0; color: ${cor}">${tipo}</h5>
            <p><strong>Local:</strong> ${descricao}</p>
            <p><strong>Severidade:</strong> <span style="color: ${cor}">${severidade}</span></p>
            <p><strong>Resolução:</strong> ${dataResolucao}</p>
            <button onclick="zoomToMarker(${lat}, ${lng})" 
                    style="background-color: #2e7d32; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 10px; width: 100%">
                Ampliar
            </button>
        </div>
    `;
    
    marker.bindPopup(popupContent);
    markers.push(marker);
}

function zoomToMarker(lat, lng) {
    map.setView([lat, lng], 18);
}

function toggleLayer(layerType) {
    switch(layerType) {
        case 'risk':
            if (map.hasLayer(riskLayer)) {
                map.removeLayer(riskLayer);
            } else {
                map.addLayer(riskLayer);
            }
            break;
        case 'scheduled':
            if (map.hasLayer(scheduledLayer)) {
                map.removeLayer(scheduledLayer);
            } else {
                map.addLayer(scheduledLayer);
            }
            break;
        case 'healthy':
            if (map.hasLayer(healthyLayer)) {
                map.removeLayer(healthyLayer);
            } else {
                map.addLayer(healthyLayer);
            }
            break;
    }
}

function filtrarZonasRisco() {
    const tipoFiltro = document.getElementById("filtroTipoRisco").value;
    
    markers.forEach(marker => marker.closePopup());
    
    markers.forEach(marker => {
        const popupContent = marker.getPopup().getContent();
        const markerType = popupContent.includes("Risco de queda") ? "queda" : 
                          popupContent.includes("Árvore doente") ? "doente" : 
                          "outro";
        
        if (tipoFiltro === "todos") {
            marker.addTo(map);
        } else if (tipoFiltro === "queda" && markerType === "queda") {
            marker.addTo(map);
            marker.openPopup();
        } else if (tipoFiltro === "doente" && markerType === "doente") {
            marker.addTo(map);
            marker.openPopup();
        } else {
            map.removeLayer(marker);
        }
    });
    
    const visibleMarkers = markers.filter(marker => map.hasLayer(marker));
    if (visibleMarkers.length > 0) {
        const group = new L.featureGroup(visibleMarkers);
        map.fitBounds(group.getBounds().pad(0.2));
    }
}

function pesquisarNoMapa() {
    const query = document.getElementById("pesquisaMapa").value;
    if (!query) return;
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                map.setView([lat, lon], 16);
                
                L.marker([lat, lon], {
                    icon: new L.Icon.Default()
                }).addTo(map)
                .bindPopup(data[0].display_name)
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

// Gestão de Podas
function carregarPodas() {
    const cronogramaPodas = [
        { bairro: "Zona 7", data: "10/07/2025", status: "agendada" },
        { bairro: "Centro", data: "15/07/2025", status: "agendada" },
        { bairro: "Jardim Alvorada", data: "20/07/2025", status: "agendada" },
        { bairro: "Zona 5", data: "05/06/2025", status: "concluída" }
    ];
    
    const listaPodas = document.getElementById("listaPodas");
    listaPodas.innerHTML = '';
    
    cronogramaPodas.forEach(poda => {
        const item = document.createElement("li");
        item.className = "list-group-item d-flex justify-content-between align-items-center";
        
        const statusBadge = poda.status === "agendada" ? 
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
    
    document.getElementById("formPoda").addEventListener("submit", function(e) {
        e.preventDefault();
        
        const local = document.getElementById("localPoda").value;
        const motivo = document.getElementById("motivoPoda").value;
        
        if (!local || !motivo) {
            mostrarMensagem("Por favor, preencha todos os campos.", "danger");
            return;
        }
        
        setTimeout(() => {
            mostrarMensagem("Solicitação de poda enviada com sucesso!", "success");
            document.getElementById("formPoda").reset();
        }, 1000);
    });
}

// Gráficos
function inicializarGraficos() {
    // Gráfico de Qualidade do Ar
    const ctxAr = document.getElementById("graficoQualidadeAr").getContext("2d");
    new Chart(ctxAr, {
        type: "bar",
        data: {
            labels: ["Centro", "Zona 7", "Jd. Alvorada", "Zona 5", "Jardim Imperial"],
            datasets: [{
                label: "Qualidade do Ar (%)",
                data: [85, 90, 80, 88, 82],
                backgroundColor: ["#388e3c", "#43a047", "#4caf50", "#66bb6a", "#81c784"],
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
    const ctxTemp = document.getElementById("graficoTemperatura").getContext("2d");
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

// Estatísticas
function atualizarEstatisticas() {
    document.getElementById("co2Reduzido").textContent = "124";
    document.getElementById("arvoresMonitoradas").textContent = "1.857";
    document.getElementById("problemasResolvidos").textContent = "326";
    
    animateValue("co2Reduzido", 0, 124, 1000);
    animateValue("arvoresMonitoradas", 0, 1857, 1000);
    animateValue("problemasResolvidos", 0, 326, 1000);
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
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