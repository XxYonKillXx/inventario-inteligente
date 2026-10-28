"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listarProductos, crearProducto, actualizarProducto, eliminarProducto } from "@/services/productos.service";
import { listarCategorias } from "@/services/categorias.service";
import type { Producto, ProductoFormData } from "@/services/productos.service";
import type { Categoria } from "@/services/categorias.service";

const IconPlus   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>;
const IconSearch = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const IconEdit   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconX      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;

type Form = { codigo:string; nombre:string; descripcion:string; categoria_id:string; unidad_medida:string; precio_compra:string; precio_venta:string; cantidad:string; stock_minimo:string; fecha_vencimiento:string; };
const FORM0: Form = { codigo:"", nombre:"", descripcion:"", categoria_id:"", unidad_medida:"unidad", precio_compra:"", precio_venta:"", cantidad:"0", stock_minimo:"0", fecha_vencimiento:"" };
const ESTADO_CFG = {
  DISPONIBLE: { cls:"bg-[var(--color-success-bg)] text-[var(--color-success)]", label:"Disponible" },
  STOCK_BAJO: { cls:"bg-[var(--color-warning-bg)] text-[var(--color-warning)]", label:"Stock bajo"  },
  AGOTADO:    { cls:"bg-[var(--color-error-bg)] text-[var(--color-error)]",     label:"Agotado"     },
};

/* helper de input reutilizable */
const inputSty = (err?: boolean) => ({
  background: "var(--bg-page)",
  borderColor: err ? "var(--color-error)" : "var(--border-color)",
  color: "var(--text-primary)",
});

export default function ProductosPage() {
  const router = useRouter();
  const [productos, setProductos]   = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando]     = useState(true);
  const [error, setError]           = useState<string|null>(null);
  const [busqueda, setBusqueda]     = useState("");
  const [catFiltro, setCatFiltro]   = useState("");
  const [modal, setModal]           = useState(false);
  const [editando, setEditando]     = useState<Producto|null>(null);
  const [form, setForm]             = useState<Form>(FORM0);
  const [errores, setErrores]       = useState<Partial<Form>>({});
  const [guardando, setGuardando]   = useState(false);
  const [eliminando, setEliminando] = useState<number|null>(null);

  const fmtCOP = (n:number) => `$ ${Number(n).toLocaleString("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 })}`;

  async function cargar() {
    setCargando(true); setError(null);
    try {
      const p: Record<string,string> = {};
      if (busqueda)  p.busqueda = busqueda;
      if (catFiltro) p.categoria_id = catFiltro;
      const [prods, cats] = await Promise.all([listarProductos(p), listarCategorias()]);
      setProductos(prods); setCategorias(cats);
    } catch (e:unknown) {
      const msg = e instanceof Error ? e.message : "Error";
      if (msg.includes("401")||msg.includes("Token")) { router.replace("/login"); return; }
      setError(msg);
    } finally { setCargando(false); }
  }
  useEffect(()=>{ cargar(); },[]);

  function abrirNuevo() { setEditando(null); setForm(FORM0); setErrores({}); setModal(true); }
  function abrirEditar(p:Producto) {
    setEditando(p);
    setForm({ codigo:p.codigo??"", nombre:p.nombre, descripcion:p.descripcion??"",
      categoria_id:String(p.categoria_id), unidad_medida:p.unidad_medida,
      precio_compra:String(p.precio_compra??""), precio_venta:String(p.precio_venta),
      cantidad:String(p.cantidad), stock_minimo:String(p.stock_minimo),
      fecha_vencimiento:p.fecha_vencimiento?p.fecha_vencimiento.split("T")[0]:"" });
    setErrores({}); setModal(true);
  }

  function validar() {
    const e:Partial<Form>={};
    if(!form.nombre.trim())  e.nombre="El nombre es requerido.";
    if(!form.categoria_id)   e.categoria_id="La categoría es requerida.";
    if(!form.precio_venta||isNaN(Number(form.precio_venta))) e.precio_venta="Precio de venta requerido.";
    setErrores(e); return Object.keys(e).length===0;
  }

  async function guardar(e:React.FormEvent) {
    e.preventDefault(); if(!validar()) return; setGuardando(true);
    const datos:ProductoFormData = { codigo:form.codigo||undefined, nombre:form.nombre,
      descripcion:form.descripcion||undefined, categoria_id:Number(form.categoria_id),
      unidad_medida:form.unidad_medida,
      precio_compra:form.precio_compra?Number(form.precio_compra):0,
      precio_venta:Number(form.precio_venta), cantidad:Number(form.cantidad),
      stock_minimo:Number(form.stock_minimo), fecha_vencimiento:form.fecha_vencimiento||undefined };
    try {
      if(editando) await actualizarProducto(editando.id, datos);
      else         await crearProducto(datos);
      setModal(false); cargar();
    } catch(err:unknown) { setErrores({nombre:err instanceof Error?err.message:"Error al guardar"}); }
    finally { setGuardando(false); }
  }

  async function handleEliminar(id:number, nombre:string) {
    if(!confirm(`¿Desactivar "${nombre}"?`)) return;
    setEliminando(id);
    try { await eliminarProducto(id); cargar(); }
    catch(e:unknown){ alert(e instanceof Error?e.message:"Error"); }
    finally { setEliminando(null); }
  }

  return (
    <div className="space-y-5 w-full">

      {error && <div className="px-4 py-3 rounded-xl border text-xs" style={{background:"var(--color-error-bg)",borderColor:"var(--color-error)",color:"var(--color-error)"}}>
        {error} <button onClick={cargar} className="underline ml-1">Reintentar</button>
      </div>}

      {/* Filtros */}
      <div className="rounded-xl border p-4 shadow-sm flex flex-wrap gap-3 items-center" style={{background:"var(--bg-card)",borderColor:"var(--border-color)"}}>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{color:"var(--text-muted)"}}><IconSearch/></span>
          <input type="search" placeholder="Buscar por nombre o código..." value={busqueda}
            onChange={e=>setBusqueda(e.target.value)} onKeyDown={e=>e.key==="Enter"&&cargar()}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border outline-none"
            style={{background:"var(--bg-page)",borderColor:"var(--border-color)",color:"var(--text-primary)"}}/>
        </div>
        <select value={catFiltro} onChange={e=>setCatFiltro(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border outline-none"
          style={{background:"var(--bg-page)",borderColor:"var(--border-color)",color:"var(--text-primary)"}}>
          <option value="">Todas las categorías</option>
          {categorias.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <button onClick={cargar} className="px-4 py-2 text-sm font-semibold text-white rounded-lg hover:opacity-90" style={{background:"var(--color-primary)"}}>Buscar</button>
        {(busqueda||catFiltro)&&<button onClick={()=>{setBusqueda("");setCatFiltro("");setTimeout(cargar,50);}} className="text-xs px-2 py-1 rounded-md" style={{color:"var(--color-error)"}}>✕ Limpiar</button>}

        <button
          onClick={abrirNuevo}
          className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-sm whitespace-nowrap"
          style={{ background: "var(--color-primary)" }}
        >
          <IconPlus />
          Nuevo producto
        </button>
      </div>

      {/* Tabla */}
      <div className="rounded-xl border shadow-sm overflow-hidden" style={{background:"var(--bg-card)",borderColor:"var(--border-color)"}}>
        <div className="px-5 py-3 border-b" style={{borderColor:"var(--border-color)"}}>
          <span className="text-sm font-medium" style={{color:"var(--text-secondary)"}}>
            {cargando?"Cargando...":`${productos.length} producto${productos.length!==1?"s":""}`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{background:"var(--bg-muted)",borderColor:"var(--border-color)"}}>
                {["Producto","Código","Categoría","Precio venta","Stock","Mín.","Estado","Acciones"].map(c=>(
                  <th key={c} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap" style={{color:"var(--text-secondary)"}}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cargando ? [...Array(5)].map((_,i)=>(
                <tr key={i} className="border-b" style={{borderColor:"var(--border-color)"}}>
                  <td colSpan={8} className="px-4 py-3"><div className="h-4 rounded animate-pulse" style={{background:"var(--bg-muted)"}}/></td>
                </tr>
              )) : productos.length===0 ? (
                <tr><td colSpan={8} className="px-4 py-16 text-center">
                  <p className="text-3xl mb-2">📦</p>
                  <p className="text-sm font-medium" style={{color:"var(--text-secondary)"}}>
                    {busqueda?"Sin resultados para esa búsqueda":"No hay productos registrados"}
                  </p>
                </td></tr>
              ) : productos.map(p=>{
                const cfg=ESTADO_CFG[p.estado_stock as keyof typeof ESTADO_CFG]??ESTADO_CFG.DISPONIBLE;
                const isLow=p.cantidad<=0, isWarn=p.cantidad>0&&p.cantidad<=p.stock_minimo;
                return (
                  <tr key={p.id} className="border-b transition-colors hover:bg-[var(--bg-muted)]" style={{borderColor:"var(--border-color)"}}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{background:"var(--color-primary-light)",color:"var(--color-primary)"}}>
                          {p.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate max-w-[180px]" style={{color:"var(--text-primary)"}}>{p.nombre}</p>
                          <p className="text-xs truncate max-w-[180px]" style={{color:"var(--text-muted)"}}>{p.descripcion||"Sin descripción"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{color:"var(--text-muted)"}}>{p.codigo||"—"}</td>
                    <td className="px-4 py-3 text-xs" style={{color:"var(--text-secondary)"}}>{p.categoria_nombre}</td>
                    <td className="px-4 py-3 font-semibold" style={{color:"var(--text-primary)"}}>{fmtCOP(p.precio_venta)}</td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-sm" style={{color:isLow?"var(--color-error)":isWarn?"var(--color-warning)":"var(--text-primary)"}}>
                        {Number(p.cantidad).toLocaleString("es-CO")}
                      </span>
                      <span className="text-xs ml-1" style={{color:"var(--text-muted)"}}>{p.unidad_medida}</span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{color:"var(--text-muted)"}}>{Number(p.stock_minimo).toLocaleString("es-CO")}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={()=>abrirEditar(p)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--color-primary-light)]" style={{color:"var(--text-secondary)"}}><IconEdit/></button>
                        <button onClick={()=>handleEliminar(p.id,p.nombre)} disabled={eliminando===p.id} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[var(--color-error-bg)] disabled:opacity-50" style={{color:"var(--text-secondary)"}}><IconTrash/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ MODAL — overlay scrolleable ═══ */}
      {modal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          style={{backgroundColor:"rgba(36,60,50,0.6)",backdropFilter:"blur(4px)"}}
          onClick={()=>setModal(false)}
        >
          <div className="flex min-h-full items-center justify-center p-4">
            <div
              className="relative w-full max-w-xl rounded-2xl shadow-2xl"
              style={{background:"var(--bg-card)"}}
              onClick={e=>e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{borderColor:"var(--border-color)"}}>
                <h2 className="text-base font-semibold" style={{color:"var(--text-primary)"}}>{editando?"Editar producto":"Nuevo producto"}</h2>
                <button onClick={()=>setModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-muted)] transition-colors" style={{color:"var(--text-muted)"}}><IconX/></button>
              </div>

              {errores.nombre&&!errores.categoria_id&&(
                <div className="mx-6 mt-4 px-3 py-2 rounded-lg text-xs" style={{background:"var(--color-error-bg)",color:"var(--color-error)"}}>{errores.nombre}</div>
              )}

              {/* Form (sin scroll propio — el overlay scrollea) */}
              <form onSubmit={guardar} className="px-6 py-5">
                <div className="grid grid-cols-2 gap-4">

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5" style={{color:"var(--text-primary)"}}>Nombre <span style={{color:"var(--color-error)"}}>*</span></label>
                    <input type="text" value={form.nombre} maxLength={150} placeholder="Nombre del producto"
                      onChange={e=>{setForm({...form,nombre:e.target.value});setErrores({});}}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                      style={inputSty(!!errores.nombre)}
                      onFocus={e=>(e.target.style.borderColor="var(--border-focus)")}
                      onBlur={e=>(e.target.style.borderColor=errores.nombre?"var(--color-error)":"var(--border-color)")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{color:"var(--text-primary)"}}>Código</label>
                    <input type="text" value={form.codigo} placeholder="SKU-001"
                      onChange={e=>setForm({...form,codigo:e.target.value})}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                      style={inputSty()}
                      onFocus={e=>(e.target.style.borderColor="var(--border-focus)")}
                      onBlur={e=>(e.target.style.borderColor="var(--border-color)")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{color:"var(--text-primary)"}}>Unidad de medida</label>
                    <select value={form.unidad_medida} onChange={e=>setForm({...form,unidad_medida:e.target.value})}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                      style={inputSty()}>
                      {["unidad","kg","g","litro","ml","caja","paquete","metro","par"].map(u=><option key={u}>{u}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5" style={{color:"var(--text-primary)"}}>Categoría <span style={{color:"var(--color-error)"}}>*</span></label>
                    <select value={form.categoria_id}
                      onChange={e=>{setForm({...form,categoria_id:e.target.value});setErrores({});}}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                      style={inputSty(!!errores.categoria_id)}>
                      <option value="">Selecciona una categoría...</option>
                      {categorias.filter(c=>c.estado).map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}
                    </select>
                    {errores.categoria_id&&<p className="mt-1 text-xs" style={{color:"var(--color-error)"}}>{errores.categoria_id}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{color:"var(--text-primary)"}}>Precio compra ($)</label>
                    <input type="number" min="0" step="0.01" value={form.precio_compra} placeholder="0"
                      onChange={e=>setForm({...form,precio_compra:e.target.value})}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                      style={inputSty()}
                      onFocus={e=>(e.target.style.borderColor="var(--border-focus)")}
                      onBlur={e=>(e.target.style.borderColor="var(--border-color)")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{color:"var(--text-primary)"}}>Precio venta ($) <span style={{color:"var(--color-error)"}}>*</span></label>
                    <input type="number" min="0" step="0.01" value={form.precio_venta} placeholder="0"
                      onChange={e=>{setForm({...form,precio_venta:e.target.value});setErrores({});}}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                      style={inputSty(!!errores.precio_venta)}
                      onFocus={e=>(e.target.style.borderColor="var(--border-focus)")}
                      onBlur={e=>(e.target.style.borderColor=errores.precio_venta?"var(--color-error)":"var(--border-color)")}
                    />
                    {errores.precio_venta&&<p className="mt-1 text-xs" style={{color:"var(--color-error)"}}>{errores.precio_venta}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{color:"var(--text-primary)"}}>{editando?"Stock actual":"Stock inicial"}</label>
                    <input type="number" min="0" step="0.001" value={form.cantidad}
                      onChange={e=>setForm({...form,cantidad:e.target.value})}
                      readOnly={!!editando}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                      style={{...inputSty(), background:editando?"var(--bg-muted)":"var(--bg-page)"}}
                    />
                    <p className="mt-1 text-xs" style={{color:"var(--text-muted)"}}>{editando?"Usa Movimientos para ajustar stock":"Se registrará como entrada inicial"}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5" style={{color:"var(--text-primary)"}}>Stock mínimo</label>
                    <input type="number" min="0" step="1" value={form.stock_minimo}
                      onChange={e=>setForm({...form,stock_minimo:e.target.value})}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                      style={inputSty()}
                      onFocus={e=>(e.target.style.borderColor="var(--border-focus)")}
                      onBlur={e=>(e.target.style.borderColor="var(--border-color)")}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5" style={{color:"var(--text-primary)"}}>Fecha vencimiento (opcional)</label>
                    <input type="date" value={form.fecha_vencimiento}
                      onChange={e=>setForm({...form,fecha_vencimiento:e.target.value})}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none"
                      style={inputSty()}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5" style={{color:"var(--text-primary)"}}>Descripción</label>
                    <textarea value={form.descripcion} rows={2} placeholder="Descripción del producto..."
                      onChange={e=>setForm({...form,descripcion:e.target.value})}
                      className="w-full px-3 py-2.5 text-sm rounded-lg border outline-none resize-none"
                      style={inputSty()}
                      onFocus={e=>(e.target.style.borderColor="var(--border-focus)")}
                      onBlur={e=>(e.target.style.borderColor="var(--border-color)")}
                    />
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3 mt-5 pt-4 border-t" style={{borderColor:"var(--border-color)"}}>
                  <button type="button" onClick={()=>setModal(false)}
                    className="flex-1 py-2.5 text-sm font-medium rounded-xl border transition-colors"
                    style={{borderColor:"var(--border-color)",color:"var(--text-secondary)",background:"var(--bg-page)"}}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={guardando}
                    className="flex-1 py-2.5 text-sm font-semibold text-white rounded-xl transition-all hover:opacity-90 disabled:opacity-50"
                    style={{background:"var(--color-primary)"}}>
                    {guardando?"Guardando...":editando?"Actualizar":"Crear producto"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
