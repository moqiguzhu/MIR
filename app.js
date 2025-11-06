/**
 * 传奇装备掉落查询系统 - 主应用逻辑
 */

class EquipmentApp {
    constructor() {
        this.allData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPage = 50;
        
        this.init();
    }
    
    /**
     * 初始化应用
     */
    async init() {
        this.bindEvents();
        await this.loadData();
        this.render();
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 搜索输入
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        // 筛选器
        document.getElementById('typeFilter').addEventListener('change', () => {
            this.applyFilters();
        });
        

        
        document.getElementById('sortBy').addEventListener('change', () => {
            this.applySort();
        });
        
        // 重置按钮
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetFilters();
        });
        
        // 分页按钮
        document.getElementById('prevPage').addEventListener('click', () => {
            this.changePage(-1);
        });
        
        document.getElementById('nextPage').addEventListener('click', () => {
            this.changePage(1);
        });
        
        // 模态框关闭
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });
        
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('detailModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }
    
    /**
     * 加载数据
     */
    async loadData() {
        try {
            const response = await fetch('equipment_data.json');
            if (!response.ok) {
                throw new Error('数据加载失败');
            }
            
            this.allData = await response.json();
            this.filteredData = [...this.allData];
            
            // 更新统计信息
            document.getElementById('totalCount').textContent = this.allData.length;
            document.getElementById('footerTotal').textContent = this.allData.length;
            
            // 隐藏加载指示器
            document.getElementById('loadingIndicator').style.display = 'none';
            
        } catch (error) {
            console.error('数据加载错误:', error);
            
            // 检查是否是 file:// 协议导致的问题
            const isFileProtocol = window.location.protocol === 'file:';
            
            document.getElementById('loadingIndicator').innerHTML = `
                <div style="color: var(--danger-color); max-width: 600px; margin: 0 auto; text-align: left;">
                    <h3 style="text-align: center; margin-bottom: 20px;">❌ 数据加载失败</h3>
                    ${isFileProtocol ? `
                        <p style="margin-bottom: 15px;">
                            <strong>原因：</strong>您直接双击打开了 HTML 文件，浏览器的安全策略阻止了数据加载。
                        </p>
                        <p style="margin-bottom: 15px;"><strong>解决方案（任选一种）：</strong></p>
                        <ol style="margin-left: 20px; line-height: 1.8;">
                            <li>
                                <strong>使用启动脚本（推荐）：</strong><br>
                                在终端运行：<code style="background: var(--bg-dark); padding: 2px 8px; border-radius: 4px;">./启动服务器.sh</code>
                            </li>
                            <li>
                                <strong>使用 Python 启动：</strong><br>
                                在终端运行：<code style="background: var(--bg-dark); padding: 2px 8px; border-radius: 4px;">python3 -m http.server 8000</code><br>
                                然后访问：<code style="background: var(--bg-dark); padding: 2px 8px; border-radius: 4px;">http://localhost:8000</code>
                            </li>
                            <li>
                                <strong>使用 VS Code：</strong><br>
                                安装 "Live Server" 插件，右键点击 index.html 选择 "Open with Live Server"
                            </li>
                        </ol>
                    ` : `
                        <p>请检查：</p>
                        <ul style="margin-left: 20px; line-height: 1.8;">
                            <li>equipment_data.json 文件是否存在</li>
                            <li>文件路径是否正确</li>
                            <li>浏览器控制台是否有错误信息</li>
                        </ul>
                        <p style="margin-top: 15px;">
                            <button onclick="location.reload()" style="padding: 10px 20px; background: var(--primary-color); color: var(--bg-dark); border: none; border-radius: 4px; cursor: pointer; font-size: 1rem;">
                                刷新页面重试
                            </button>
                        </p>
                    `}
                </div>
            `;
        }
    }
    
    /**
     * 处理搜索
     */
    handleSearch(keyword) {
        keyword = keyword.toLowerCase().trim();
        
        if (!keyword) {
            this.applyFilters();
            return;
        }
        
        this.filteredData = this.allData.filter(item => {
            return item.name.toLowerCase().includes(keyword) ||
                   (item.bestMonster && item.bestMonster.toLowerCase().includes(keyword));
        });
        
        this.currentPage = 1;
        this.render();
    }
    
    /**
     * 应用筛选器
     */
    applyFilters() {
        const typeFilter = document.getElementById('typeFilter').value;
        
        this.filteredData = this.allData.filter(item => {
            const typeMatch = !typeFilter || item.type === typeFilter;
            return typeMatch;
        });
        
        this.currentPage = 1;
        this.render();
    }
    
    /**
     * 应用排序
     */
    applySort() {
        const sortBy = document.getElementById('sortBy').value;
        
        this.filteredData.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name, 'zh-CN');
                case 'type':
                    return a.type.localeCompare(b.type, 'zh-CN');
                case 'probability':
                    return a.probabilityValue - b.probabilityValue;
                default:
                    return 0;
            }
        });
        
        this.render();
    }
    
    /**
     * 重置筛选器
     */
    resetFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('typeFilter').value = '';
        document.getElementById('sortBy').value = 'name';
        
        this.filteredData = [...this.allData];
        this.currentPage = 1;
        this.render();
    }
    
    /**
     * 切换页面
     */
    changePage(direction) {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        const newPage = this.currentPage + direction;
        
        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPage = newPage;
            this.render();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    /**
     * 渲染页面
     */
    render() {
        this.renderTable();
        this.renderPagination();
        this.updateStats();
    }
    
    /**
     * 渲染表格
     */
    renderTable() {
        const tbody = document.getElementById('equipmentTableBody');
        const emptyState = document.getElementById('emptyState');
        
        // 计算当前页数据
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);
        
        if (pageData.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        tbody.innerHTML = pageData.map(item => `
            <tr>
                <td>
                    <span class="type-badge">${item.type}</span>
                </td>
                <td>
                    <strong>${item.name}</strong>
                </td>
                <td>${item.bestMonster || '未知'}</td>
                <td>
                    <span class="probability">${item.bestProbability || '-'}</span>
                </td>
                <td>
                    <button class="detail-btn" onclick="app.showDetail('${item.name.replace(/'/g, "\\'")}')">
                        查看详情
                    </button>
                </td>
            </tr>
        `).join('');
    }
    
    /**
     * 渲染分页
     */
    renderPagination() {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        const pageInfo = document.getElementById('pageInfo');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        pageInfo.textContent = `第 ${this.currentPage} 页 / 共 ${totalPages} 页`;
        
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
    }
    
    /**
     * 更新统计信息
     */
    updateStats() {
        document.getElementById('displayCount').textContent = this.filteredData.length;
    }
    
    /**
     * 显示装备详情
     */
    showDetail(itemName) {
        const item = this.allData.find(i => i.name === itemName);
        if (!item) return;
        
        const modal = document.getElementById('detailModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        
        modalTitle.textContent = `${item.name} - 详细信息`;
        
        // 按概率排序所有掉落
        const sortedDrops = [...item.allDrops].sort((a, b) => a.denominator - b.denominator);
        
        modalBody.innerHTML = `
            <div style="margin-bottom: 20px;">
                <p><strong>装备类型：</strong> <span class="type-badge">${item.type}</span></p>
                <p><strong>最佳掉落：</strong> ${item.bestMonster} (${item.bestProbability})</p>
            </div>
            
            <h3 style="color: var(--primary-color); margin-bottom: 15px;">所有掉落来源 (${sortedDrops.length} 个怪物)</h3>
            <ul class="drop-list">
                ${sortedDrops.map((drop, index) => `
                    <li class="drop-item">
                        <strong>${index + 1}. ${drop.monster}</strong>
                        <span style="float: right; color: var(--primary-color);">${drop.probability}</span>
                    </li>
                `).join('')}
            </ul>
        `;
        
        modal.style.display = 'block';
    }
    
    /**
     * 关闭模态框
     */
    closeModal() {
        document.getElementById('detailModal').style.display = 'none';
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EquipmentApp();
});
