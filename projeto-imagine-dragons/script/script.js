var produtos = [];    // Array  para armazenar os produtos carregados do JSON
var categorias = [];  // Array  para armazenar as categorias carregadas do JSON

// Busca o arquivo catalog.json e processa os dados
fetch('catalog.json')
  .then(res => res.json())   // Converte a resposta para JSON
  .then(data => {
    produtos = data.products;     // Armazena produtos do JSON na variável global
    categorias = data.categories; // Armazena categorias do JSON na variável global

    mostrarProdutosIniciais();  // Mostra os produtos agrupados por categoria inicialmente
    preencherDropdown();        // Preenche o dropdown de filtro de categorias
    preencherFormulario();      // Preenche o select do formulário com os produtos
    mostrarTodos('todos');      // Exibe todos os produtos na seção 'todos-produtos'
  })
  .catch(err => console.error('Erro ao carregar JSON:', err));  // Trata erro no fetch

// Função que cria o card HTML para um produto (com imagem e detalhes)
function criarCardProduto(produto) {
  var card = document.createElement('div');
  card.className = 'card';
  card.style.width = '18rem';

  const link = document.createElement('a');
  link.href = produto.image;  // Link para a imagem do produto (para lightbox)
  link.setAttribute('data-lightbox', 'produtos');  // Atributo para galeria lightbox
  link.setAttribute('data-title', `${produto.name} - ${produto.description}`);

  const img = document.createElement('img');
  img.src = produto.image;
  img.className = 'card-img-top';
  img.alt = produto.name;
  link.appendChild(img);

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';
  cardBody.innerHTML = `
    <h5 class="card-title">${produto.name}</h5>
    <p class="card-text">${produto.description}</p>
    <p class="card-text fw-bold">${produto.price} €</p>
  `;

  card.appendChild(link);
  card.appendChild(cardBody);

  return card;  // Retorna o elemento card criado
}

// Exibe produtos agrupados por categorias na div 'categorias-container'
function mostrarProdutosIniciais() {
  const container = document.getElementById('categorias-container');
  container.innerHTML = '';  // Limpa o conteúdo antes de preencher

  categorias.forEach(cat => {
    const filtrados = produtos.filter(p => p.category === cat.id);
    if (!filtrados.length) return;  // Se não houver produtos nesta categoria, pula

    const secao = document.createElement('section');
    secao.className = 'mb-5';

    const titulo = document.createElement('h2');
    titulo.textContent = cat.name;
    titulo.className = 'mb-3 border-bottom pb-2';

    const lista = document.createElement('div');
    lista.className = 'd-flex flex-wrap gap-4';

    filtrados.forEach(prod => lista.appendChild(criarCardProduto(prod)));  // Adiciona cards

    secao.append(titulo, lista);
    container.appendChild(secao);
  });
}

// Preenche o select de produtos no formulário com os nomes e IDs
function preencherFormulario() {
  const select = document.getElementById('product');
  select.innerHTML = '';  // Limpa opções anteriores

  produtos.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    select.appendChild(opt);
  });

  // Atualiza o preço mostrado quando o produto selecionado muda
  select.addEventListener('change', () => {
    const prod = produtos.find(p => p.id === select.value);
    document.getElementById('preco-display').textContent = `Preço por unidade de ${prod.price} €`;
  });

  select.dispatchEvent(new Event('change'));  // Dispara evento para atualizar preço inicialmente
}

// Preenche o dropdown de filtro de categorias com a opção "Todos" + categorias
function preencherDropdown() {
  const select = document.getElementById('filtroCategoria');
  select.innerHTML = '<option value="todos">Todos</option>';  // Opção padrão

  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = cat.name;
    select.appendChild(opt);
  });

  // Ao mudar filtro, mostra apenas os produtos da categoria selecionada
  select.addEventListener('change', () => mostrarTodos(select.value));
}

// Exibe os produtos filtrados na div 'todos-produtos'
function mostrarTodos(categoria = 'todos') {
  const container = document.getElementById('todos-produtos');
  container.innerHTML = '';  // Limpa conteúdo anterior

  // Filtra produtos conforme categoria selecionada ou exibe todos
  const filtrados = categoria === 'todos'
    ? produtos
    : produtos.filter(p => p.category === categoria);

  filtrados.forEach(prod => container.appendChild(criarCardProduto(prod)));  // Cria cards
}

// Manipulador do submit do formulário de pedido
document.getElementById('calc-form').addEventListener('submit', e => {
  e.preventDefault();  // Evita recarregar página

  const nome = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const produtoId = document.getElementById('product').value;
  const quantidade = parseInt(document.getElementById('quantity').value);

  // Validação básica dos campos
  if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nome) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !produtoId || quantidade < 1) {
    alert('Por favor, preencha todos os campos corretamente.');
    return;
  }

  const produto = produtos.find(p => p.id === produtoId);
  const total = (produto.price * quantidade).toFixed(2);  // Calcula total com 2 casas decimais

  // Exibe os detalhes do pedido e valor total
  document.getElementById('total-value').innerHTML = `
    <div style="border: 5px solid white; border-radius: 3px"> <br>  
    <p><strong>Nome:</strong> ${nome}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Tipo de produto (categoria):</strong> ${produto.category}</p>
    <p><strong>Quantidade:</strong> ${quantidade}</p>
    <p><strong>Descrição:</strong> ${produto.description}</p>
    <p class="mt-3" style="color: green"><strong>Valor total:</strong> ${total} €</p>
    </div>
  `;

  // Exibe um toast (notificação) de sucesso
  document.getElementById('toast-body').textContent = 'Pedido efetuado com sucesso! 🎉 Verifique o valor total abaixo.';
  const meuToast = new bootstrap.Toast(document.getElementById('meuToast'));
  meuToast.show();
});

// Botão "Voltar ao topo"
const btnTopo = document.getElementById('btnTopo');

// Exibe o botão apenas quando a página é rolada mais de 300px para baixo
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    btnTopo.style.display = 'block';
  } else {
    btnTopo.style.display = 'none';
  }
});

// Ao clicar no botão, a página rola suavemente para o topo
btnTopo.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
