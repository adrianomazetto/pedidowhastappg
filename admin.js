document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('form-cadastro');
    const listaPratosContainer = document.getElementById('lista-pratos-admin');

    // Função para buscar e renderizar os pratos do Supabase
    async function carregarPratos() {
        const { data: pratos, error } = await supabase
            .from('pratos')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar pratos:', error);
            listaPratosContainer.innerHTML = '<p>Erro ao carregar o cardápio.</p>';
            return;
        }

        listaPratosContainer.innerHTML = '';
        if (pratos.length === 0) {
            listaPratosContainer.innerHTML = '<p>Nenhum prato cadastrado.</p>';
            return;
        }

        pratos.forEach(item => {
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
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nomePrato = document.getElementById('nome-prato').value;
        const precoPrato = parseFloat(document.getElementById('preco-prato').value);

        if (nomePrato && !isNaN(precoPrato)) {
            const { error } = await supabase
                .from('pratos')
                .insert([{ nome: nomePrato, preco: precoPrato }]);

            if (error) {
                console.error('Erro ao cadastrar prato:', error);
                alert('Falha ao cadastrar o prato.');
            } else {
                formCadastro.reset();
                await carregarPratos(); // Recarrega a lista
            }
        } else {
            alert('Por favor, preencha os dados do prato corretamente.');
        }
    });

    // Evento: Excluir prato
    listaPratosContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            
            const { error } = await supabase
                .from('pratos')
                .delete()
                .eq('id', itemId);

            if (error) {
                console.error('Erro ao excluir prato:', error);
                alert('Falha ao excluir o prato.');
            } else {
                await carregarPratos(); // Recarrega a lista
            }
        }
    });

    // Carregamento inicial
    carregarPratos();
});