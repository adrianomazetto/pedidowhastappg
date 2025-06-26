document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const menuItemsContainer = document.getElementById('menu-items');
    const listaPedido = document.getElementById('lista-pedido');
    const totalPedidoEl = document.getElementById('total-pedido');
    const enviarWhatsAppBtn = document.getElementById('enviar-whatsapp');
    const nomeClienteInput = document.getElementById('nome-cliente');
    const horarioClienteInput = document.getElementById('horario-cliente');
    const pedidoVazioEl = document.getElementById('pedido-vazio');

    // Estado da aplicação
    let menu = []; // O menu agora será carregado do Supabase
    let pedido = [];

    // Função para carregar o cardápio do Supabase
    async function carregarMenu() {
        const { data, error } = await supabase
            .from('pratos')
            .select('id, nome, preco, foto_url')
            .order('nome', { ascending: true });

        if (error) {
            console.error('Erro ao carregar o cardápio:', error);
            menuItemsContainer.innerHTML = '<p>Não foi possível carregar o cardápio. Tente novamente mais tarde.</p>';
            return;
        }
        menu = data;
        renderizarMenu();
    }

    // Função para renderizar o cardápio
    function renderizarMenu() {
        menuItemsContainer.innerHTML = '';
        if (menu.length === 0) {
            menuItemsContainer.innerHTML = '<p>Nenhum prato cadastrado para hoje.</p>';
            return;
        }
        menu.forEach(item => {
            const menuItemEl = document.createElement('div');
            menuItemEl.classList.add('menu-item');
            menuItemEl.innerHTML = `
                <img src="${item.foto_url}" alt="${item.nome}" class="menu-item-img">
                <div class="menu-item-content">
                    <h3>${item.nome}</h3>
                    <p class="price">R$ ${item.preco.toFixed(2).replace('.', ',')}</p>
                    <button data-id="${item.id}">Adicionar ao Pedido</button>
                </div>
            `;
            menuItemsContainer.appendChild(menuItemEl);
        });
    }

    // Função para renderizar o resumo do pedido
    function renderizarPedido() {
        listaPedido.innerHTML = '';
        if (pedido.length === 0) {
            listaPedido.appendChild(pedidoVazioEl);
            pedidoVazioEl.style.display = 'flex';
        } else {
            pedidoVazioEl.style.display = 'none';
            pedido.forEach(item => {
                const listItemEl = document.createElement('li');
                listItemEl.innerHTML = `
                    <span>${item.quantidade}x ${item.nome}</span>
                    <span class="item-controls">
                        R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                        <button class="remover-item" data-id="${item.id}">✖</button>
                    </span>
                `;
                listaPedido.appendChild(listItemEl);
            });
        }
        calcularTotal();
    }

    // Função para calcular o total do pedido
    function calcularTotal() {
        const total = pedido.reduce((acc, item) => acc + (item.preco * item.quantidade), 0);
        totalPedidoEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    // Função para adicionar item ao pedido
    function adicionarAoPedido(itemId) {
        const itemNoMenu = menu.find(item => item.id === itemId);
        const itemNoPedido = pedido.find(item => item.id === itemId);

        if (itemNoPedido) {
            itemNoPedido.quantidade++;
        } else {
            pedido.push({ ...itemNoMenu, quantidade: 1 });
        }
        renderizarPedido();
    }

    // Função para remover item do pedido
    function removerDoPedido(itemId) {
        const itemNoPedido = pedido.find(item => item.id === itemId);

        if (itemNoPedido) {
            itemNoPedido.quantidade--;
            if (itemNoPedido.quantidade === 0) {
                pedido = pedido.filter(item => item.id !== itemId);
            }
        }
        renderizarPedido();
    }

    // Evento: Adicionar item ao clicar no botão do cardápio
    menuItemsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            adicionarAoPedido(itemId);
        }
    });

    // Evento: Remover item do pedido
    listaPedido.addEventListener('click', (e) => {
        if (e.target.classList.contains('remover-item')) {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            removerDoPedido(itemId);
        }
    });

    // Evento: Enviar pedido para o WhatsApp
    enviarWhatsAppBtn.addEventListener('click', () => {
        const nomeCliente = nomeClienteInput.value.trim();
        const horarioCliente = horarioClienteInput.value.trim();

        if (pedido.length === 0) {
            alert('Seu carrinho está vazio. Adicione itens antes de enviar.');
            return;
        }

        if (!nomeCliente || !horarioCliente) {
            alert('Por favor, preencha seu nome e o horário de retirada para finalizar o pedido.');
            return;
        }

        // Monta a mensagem com layout de cupom térmico
        const agora = new Date();
        const dataFormatada = `${agora.getDate().toString().padStart(2, '0')}/${(agora.getMonth() + 1).toString().padStart(2, '0')}/${agora.getFullYear()}`;
        const horaFormatada = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`;

        let cupomText = `      CANTINA VIRTUAL\n`;
        cupomText += `--------------------------------\n`;
        cupomText += `      COMPROVANTE DE PEDIDO\n`;
        cupomText += `--------------------------------\n`;
        cupomText += `CLIENTE: ${nomeCliente}\n`;
        cupomText += `HORÁRIO RETIRADA: ${horarioCliente}\n`;
        cupomText += `--------------------------------\n`;
        cupomText += `QTD | ITEM\n`;
        cupomText += `--------------------------------\n`;

        pedido.forEach(item => {
            cupomText += `${item.quantidade.toString().padEnd(3, ' ')} | ${item.nome}\n`;
        });

        cupomText += `--------------------------------\n`;
        cupomText += `TOTAL: ${totalPedidoEl.textContent}\n`;
        cupomText += `--------------------------------\n`;
        cupomText += `Pedido gerado em: ${dataFormatada} ${horaFormatada}`;

        // Codifica o texto do cupom em Base64 para passar pela URL
        const cupomBase64 = btoa(cupomText);

        // Gera o link de impressão
        const urlImpressao = `${window.location.origin}${window.location.pathname.replace('index.html', '')}print.html?data=${cupomBase64}`;

        // Monta a mensagem final para o WhatsApp
        let mensagem = `*Novo Pedido Recebido!*\n\n`;
        mensagem += `*Cliente:* ${nomeCliente}\n`;
        mensagem += `*Horário:* ${horarioCliente}\n`;
        mensagem += `*Total:* ${totalPedidoEl.textContent}\n\n`;
        mensagem += `*Clique no link para imprimir o cupom:*\n${urlImpressao}`;

        // Número de telefone para onde o pedido será enviado
        const numeroWhatsApp = '5515981693581'; // SEU NÚMERO AQUI

        // Codifica a mensagem para URL e abre o link do WhatsApp
        const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
        
        window.open(linkWhatsApp, '_blank');
    });

    // Renderização inicial
    carregarMenu();
    renderizarPedido();
});