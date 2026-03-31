// シンプルな ToDo ロジック
// - タスクの追加、完了切替、削除
// - localStorage に永続化

(() => {
	const STORAGE_KEY = 'todo_app_tasks_v1';

	const input = document.getElementById('task-input');
	const addBtn = document.getElementById('add-btn');
	const deleteBtn = document.getElementById('delete-selected-btn');
	const markCompleteBtn = document.getElementById('mark-complete-btn');
	const listEl = document.getElementById('task-list');

	let tasks = [];

	function save() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
	}

	function load() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			tasks = raw ? JSON.parse(raw) : [];
		} catch (e) {
			tasks = [];
			console.error('failed to load tasks', e);
		}
	}

	function createTaskElement(task) {
		const li = document.createElement('li');

		const checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		// チェックは「選択」(完了対象や削除対象)のために使う
		checkbox.checked = !!task.selected;
		checkbox.addEventListener('change', () => {
			task.selected = checkbox.checked;
			save();
			render();
		});

		// 表示用のテキスト要素
		const span = document.createElement('span');
		span.className = 'task-text' + (task.done ? ' done' : '');
		span.textContent = task.text;

		// 削除ボタン
		const del = document.createElement('button');
		del.className = 'btn-delete';
		del.type = 'button';
		del.textContent = '削除';
		del.addEventListener('click', () => {
			tasks = tasks.filter(t => t.id !== task.id);
			save();
			render();
		});

		// テキストクリックで編集モードに切替え
		span.addEventListener('click', () => {
			// 入力フィールドと保存ボタンを作成
			const inputEdit = document.createElement('input');
			inputEdit.type = 'text';
			inputEdit.value = task.text;
			inputEdit.className = 'edit-input';

			const saveBtn = document.createElement('button');
			saveBtn.type = 'button';
			saveBtn.className = 'btn-edit';
			saveBtn.textContent = '編集';

			// 既存の span を入力欄に置き換え、保存ボタンは削除ボタンの手前に挿入
			li.replaceChild(inputEdit, span);
			li.insertBefore(saveBtn, del);

			inputEdit.focus();
			inputEdit.select();

			function finishEdit() {
				const v = inputEdit.value.trim();
				if (v) {
					task.text = v;
					save();
				}
				// 編集後は再描画して元に戻す
				render();
			}

			saveBtn.addEventListener('click', finishEdit);
			inputEdit.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') finishEdit();
				if (e.key === 'Escape') render();
			});
		});

		li.appendChild(checkbox);
		li.appendChild(span);
		li.appendChild(del);

		return li;
	}

	function render() {
		listEl.innerHTML = '';
		if (tasks.length === 0) {
			const empty = document.createElement('li');
			empty.style.color = '#666';
			empty.style.padding = '8px';
			empty.textContent = 'タスクがありません。';
			listEl.appendChild(empty);
			return;
		}

		tasks.forEach(task => {
			listEl.appendChild(createTaskElement(task));
		});
	}

	function addTask(text) {
		const t = text.trim();
		if (!t) return;
		// selected はチェック状態（完了対象/削除対象）を表す
		const task = { id: Date.now(), text: t, done: false, selected: false };
		tasks.unshift(task);
		save();
		render();
	}

	function deleteSelected() {
		// チェックされた（selected）タスクを削除
		const before = tasks.length;
		tasks = tasks.filter(t => !t.selected);
		if (tasks.length !== before) {
			save();
			render();
		}
	}

	function markComplete() {
		let changed = false;
		tasks.forEach(t => {
			if (t.selected) {
				if (!t.done) changed = true;
				t.done = true;
				t.selected = false; // 完了したら選択解除
			}
		});
		if (changed) {
			save();
			render();
		}
	}

	addBtn.addEventListener('click', () => {
		addTask(input.value);
		input.value = '';
		input.focus();
	});

	// 上部の「削除」ボタン（選択したタスクを一括削除）
	if (deleteBtn) {
		deleteBtn.addEventListener('click', () => {
			deleteSelected();
			input.focus();
		});
	}

	// 「完了」ボタン: 選択されたタスクに取り消し線 (done=true) を適用
	if (markCompleteBtn) {
		markCompleteBtn.addEventListener('click', () => {
			markComplete();
			input.focus();
		});
	}

	input.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			addTask(input.value);
			input.value = '';
		}
	});

	// 初期化
	document.addEventListener('DOMContentLoaded', () => {
		load();
		render();
	});

	// Immediately initialize in case script runs after DOM is ready (we used defer)
	if (document.readyState === 'complete' || document.readyState === 'interactive') {
		load();
		render();
	}
})();