document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('form-cadastro');
    const listaPratosContainer = document.getElementById('lista-pratos-admin');

    // Carrega o menu do localStorage ou inicializa com um array vazio
    let menu = JSON.parse(localStorage.getItem('menu')) || [];

    // Função para salvar o menu no localStorage
    function salvarMenu() {
        localStorage.setItem('menu', JSON.stringify(menu));
    }

    // Função para renderizar a lista de pratos na página de admin
    function renderizarListaAdmin() {
        listaPratosContainer.innerHTML = '';
        if (menu.length === 0) {
            listaPratosContainer.innerHTML = '<p>Nenhum prato cadastrado.</p>';
            return;
        }

        menu.forEach(item => {
            const pratoItemEl = document.createElement('div');
            pratoItemEl.classList.add('prato-item');
            pratoItemEl.innerHTML = `
                <div class="prato-info">
                    <h3>${item.nome}</h3>
                    <span class="price">R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                </div>
                <button class="delete-btn" data-id="${item.id}">Excluir</button>
            `;
            listaPratosContainer.appendChild(pratoItemEl);
        });
    }

    // Evento: Cadastrar novo prato
    formCadastro.addEventListener('submit', (e) => {
        e.preventDefault();
        const nomePrato = document.getElementById('nome-prato').value;
        const precoPrato = parseFloat(document.getElementById('preco-prato').value);

        if (nomePrato && !isNaN(precoPrato)) {
            const novoPrato = {
                id: menu.length > 0 ? Math.max(...menu.map(p => p.id)) + 1 : 1,
                nome: nomePrato,
                preco: precoPrato
            };
            menu.push(novoPrato);
            salvarMenu();
            renderizarListaAdmin();
            formCadastro.reset();
        } else {
            alert('Por favor, preencha os dados do prato corretamente.');
        }
    });

    // Evento: Excluir prato
    listaPratosContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            // Filtra o menu, removendo o item com o ID correspondente
            menu = menu.filter(item => item.id !== itemId);
            salvarMenu();
            renderizarListaAdmin();
        }
    });

    // Renderização inicial
    renderizarListaAdmin();
});
