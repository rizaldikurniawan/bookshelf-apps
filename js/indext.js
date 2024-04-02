//EVENT itu supaya bisa berinteraksi dengan elemen html

const bukuBuku = [];
const CUSTOM_EVENT = 'jalankan-buku';
const Bookshelf_Apps_Key = 'Bookshelf Apps';
const SAVE_EVENT = 'simpan-buku';
const SEARCH_EVENT = 'cari-buku';
const EDIT_EVENT = 'edit-buku';
let idBukuEdit = null;

//saat pertama kali dibuka
document.addEventListener('DOMContentLoaded', function () {
  const submit = document.getElementById('form');
  submit.addEventListener('submit', function (event) {
    event.preventDefault();
    tambahBuku();
  });

  const search = document.getElementById('form2');
  search.addEventListener('submit', function (event) {
    event.preventDefault();
    document.dispatchEvent(new Event(SEARCH_EVENT));
  });

  const edit = document.getElementById('edit-form');
  edit.addEventListener('submit', function (event) {
    event.preventDefault();
    document.dispatchEvent(new Event(EDIT_EVENT));
  });

  if (isStorageExist()) {
    munculkanData();
  }
});

//fungsi tambahBuku
function tambahBuku() {
  const titleBuku = document.getElementById('title').value;
  const authorBuku = document.getElementById('author').value;
  const yearBuku = parseInt(document.getElementById('year').value);

  const buatIdBuku = buatIDBuku();
  const objekBuku = buatObjekBuku(buatIdBuku, titleBuku, authorBuku, yearBuku, false);
  bukuBuku.push(objekBuku);

  document.dispatchEvent(new Event(CUSTOM_EVENT));
  saveData();
}

//fungsi membuat sebuah id
function buatIDBuku() {
  return +new Date();
}

//membuat objekBuku
function buatObjekBuku(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

//memasukkan teks ke div,
document.addEventListener(CUSTOM_EVENT, function () {
  const listBukuBelumSelesai = document.getElementById('buku-belum-selesai');
  listBukuBelumSelesai.innerHTML = '';

  const listBukuSelesai = document.getElementById('buku-sudah-selesai');
  listBukuSelesai.innerHTML = '';

  for (const bukuItem of bukuBuku) {
    const elemenBuku = bukuBelumSelesaidanSelesai(bukuItem);
    //listBukuBelumSelesai.append(elemenBuku);
    if (!bukuItem.isComplete) {
      listBukuBelumSelesai.append(elemenBuku);
    } else {
      listBukuSelesai.append(elemenBuku);
    }
  }
});

//membuat fungsi buku belum selesai
function bukuBelumSelesaidanSelesai(objekBuku) {
  const textTitle = document.createElement('h2');
  textTitle.innerText = objekBuku.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = objekBuku.author;

  const textYear = document.createElement('p');
  textYear.innerText = objekBuku.year;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement('div');
  container.append(textContainer);
  container.setAttribute('id', `buku-${objekBuku.id}`);

  //jika buku masih bernilai false (belum dibaca)
  if (!objekBuku.isComplete) {
    const buttonSelesai = document.createElement('button');
    buttonSelesai.innerText = 'Selesai';
    buttonSelesai.addEventListener('click', function () {
      membacaBukuSelesai(objekBuku.id);
    });

    const hapusButton = document.createElement('button');
    hapusButton.innerText = 'Hapus';
    hapusButton.addEventListener('click', function () {
      hapusBuku(objekBuku.id);
    });

    const buttonEdit = document.createElement('button');
    buttonEdit.innerText = 'Edit';
    buttonEdit.addEventListener('click', function () {
      menampilkanBuku(objekBuku.id);
    });

    //ini buttonnya dimasukkan ke container
    container.append(buttonSelesai, hapusButton, buttonEdit);
  } else {
    const undoButton = document.createElement('button');
    undoButton.innerText = 'Undo';

    undoButton.addEventListener('click', function () {
      batalkanSelesai(objekBuku.id);
    });

    const hapusButton = document.createElement('button');
    hapusButton.innerText = 'Hapus';

    hapusButton.addEventListener('click', function () {
      hapusBuku(objekBuku.id);
    });

    const buttonEdit = document.createElement('button');
    buttonEdit.innerText = 'Edit';

    buttonEdit.addEventListener('click', function () {
      menampilkanBuku(objekBuku.id);
    });

    container.append(undoButton, hapusButton, buttonEdit);
  }
  return container;
}

//fungsi untuk belum -> selesai
function membacaBukuSelesai(idBuku) {
  const bukuTarget = cariBuku(idBuku);

  if (bukuTarget == null) return;

  bukuTarget.isComplete = true;
  document.dispatchEvent(new Event(CUSTOM_EVENT));
  saveData();
}

//fungsi untuk menghapus buku
function hapusBuku(todoId) {
  const bukuTarget = cariIndexBuku(todoId);

  if (bukuTarget === -1) return;

  //hapus index
  bukuBuku.splice(bukuTarget, 1);
  document.dispatchEvent(new Event(CUSTOM_EVENT));
  saveData();
}

//fungsi untuk undo Selesai
function batalkanSelesai(todoId) {
  const bukuTarget = cariBuku(todoId);

  if (bukuTarget == null) return;

  bukuTarget.isComplete = false;
  document.dispatchEvent(new Event(CUSTOM_EVENT));
  saveData();
}

//menampilkan buku
function menampilkanBuku(todoId) {
  const bukuTarget = cariBuku(todoId);

  if (bukuTarget !== null) {
    const titleBaru = document.getElementById('edit-title');
    titleBaru.value = bukuTarget.title;

    const authorBaru = document.getElementById('edit-author');
    authorBaru.value = bukuTarget.author;

    const yearBaru = document.getElementById('edit-year');
    yearBaru.value = bukuTarget.year;

    idBukuEdit = todoId;
    return true;
  } else {
    return;
  }
}

//edit event
document.addEventListener(EDIT_EVENT, function () {
  const listBukuBelumSelesai = document.getElementById('buku-belum-selesai');
  listBukuBelumSelesai.innerHTML = '';

  const listBukuSelesai = document.getElementById('buku-sudah-selesai');
  listBukuSelesai.innerHTML = '';

  const editTitle = document.getElementById('edit-title');
  const editAuthor = document.getElementById('edit-author');
  const editYear = document.getElementById('edit-year');

  for (const bukuItem of bukuBuku) {
    if (editTitle.value !== null && editAuthor.value !== null && editYear.value !== null && bukuItem.id == idBukuEdit) {
      bukuItem.title = editTitle.value;
      bukuItem.author = editAuthor.value;
      bukuItem.year = editYear.value;
    }
  }
  document.dispatchEvent(new Event(CUSTOM_EVENT));
  saveData();
});

//mencari idBuku
function cariBuku(idBuku) {
  for (const bukuItem of bukuBuku) {
    if (bukuItem.id === idBuku) {
      return bukuItem;
    }
  }
  return null;
}

//search event
document.addEventListener(SEARCH_EVENT, function () {
  const listBukuBelumSelesai = document.getElementById('buku-belum-selesai');
  listBukuBelumSelesai.innerHTML = '';

  const listBukuSelesai = document.getElementById('buku-sudah-selesai');
  listBukuSelesai.innerHTML = '';

  const inputanSearch = document.getElementById('search').value;

  for (const bukuItem of bukuBuku) {
    const elemenBuku = bukuBelumSelesaidanSelesai(bukuItem);
    if (!bukuItem.isComplete && bukuItem.title == inputanSearch) {
      listBukuBelumSelesai.append(elemenBuku);
    } else if (bukuItem.isComplete && bukuItem.title == inputanSearch) {
      listBukuSelesai.append(elemenBuku);
    }
  }
});

//mencari indext buku
function cariIndexBuku(todoId) {
  for (const index in bukuBuku) {
    if (bukuBuku[index].id === todoId) {
      return index;
    }
  }
  return -1;
}

//untuk menyimpan data
function saveData() {
  if (isStorageExist()) {
    //memeriksa apakah browser mendukung local storage atau tidak
    const konversi = JSON.stringify(bukuBuku);
    localStorage.setItem(Bookshelf_Apps_Key, konversi);
    document.dispatchEvent(new Event(SAVE_EVENT));
  }
}

//fungsi mengecek apakakah browser mendukung local Storage
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Mohon Maaf, Browser Kamu Tidak Mendukung Local Storage');
    return false;
  }
  return true;
}

document.addEventListener(SAVE_EVENT, function () {
  console.log(localStorage.getItem(Bookshelf_Apps_Key));
});

//fungsi memunculkan data ketika halaman dibuka
function munculkanData() {
  const ambilData = localStorage.getItem(Bookshelf_Apps_Key);
  let data = JSON.parse(ambilData);

  if (data !== null) {
    for (const buku of data) {
      bukuBuku.push(buku);
    }
  }
  document.dispatchEvent(new Event(CUSTOM_EVENT));
}
