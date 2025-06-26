document.addEventListener('DOMContentLoaded', () => {
    const formCadastro = document.getElementById('form-cadastro');
    const listaPratosContainer = document.getElementById('lista-pratos-admin');
    const BUCKET_NAME = 'fotos-pratos';

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
                <img src="${item.foto_url}" alt="${item.nome}" class="prato-img">
                <div class="prato-info">
                    <h3>${item.nome}</h3>
                    <span class="price">R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
                </div>
                <button class="delete-btn" data-id="${item.id}" data-foto-url="${item.foto_url}">Excluir</button>
            `;
            listaPratosContainer.appendChild(pratoItemEl);
        });
    }

    // Evento: Cadastrar novo prato
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nomePrato = document.getElementById('nome-prato').value;
        const precoPrato = parseFloat(document.getElementById('preco-prato').value);
        const fotoInput = document.getElementById('foto-prato');
        const fotoFile = fotoInput.files[0];

        if (!nomePrato || isNaN(precoPrato) || !fotoFile) {
            alert('Por favor, preencha todos os campos, incluindo a foto.');
            return;
        }

        // 1. Fazer upload da foto
        const filePath = `public/${Date.now()}-${fotoFile.name}`;
        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, fotoFile);

        if (uploadError) {
            console.error('Erro no upload:', uploadError);
            alert('Falha ao enviar a foto.');
            return;
        }

        // 2. Obter a URL pública da imagem
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        // 3. Salvar os dados no banco de dados
        const { error: insertError } = await supabase
            .from('pratos')
            .insert([{ nome: nomePrato, preco: precoPrato, foto_url: urlData.publicUrl }]);

        if (insertError) {
            console.error('Erro ao cadastrar prato:', insertError);
            alert('Falha ao cadastrar o prato no banco de dados.');
        } else {
            formCadastro.reset();
            await carregarPratos();
        }
    });

    // Evento: Excluir prato e foto
    listaPratosContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const itemId = parseInt(e.target.getAttribute('data-id'));
            const fotoUrl = e.target.getAttribute('data-foto-url');
            
            // 1. Excluir a referência do banco de dados
            const { error: dbError } = await supabase
                .from('pratos')
                .delete()
                .eq('id', itemId);

            if (dbError) {
                console.error('Erro ao excluir do DB:', dbError);
                alert('Falha ao excluir o prato do banco de dados.');
                return;
            }

            // 2. Excluir o arquivo do Storage
            if (fotoUrl) {
                const filePath = fotoUrl.split('/').pop(); // Extrai o nome do arquivo da URL
                const { error: storageError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .remove([`public/${filePath}`]);
                
                if (storageError) {
                     console.error('Erro ao excluir foto do Storage:', storageError);
                }
            }

            await carregarPratos();
        }
    });

    // Carregamento inicial
    carregarPratos();
});
