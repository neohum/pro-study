package com.prostudy.eink.ui.reference

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.prostudy.eink.R
import com.prostudy.eink.data.FunctionItem
import com.prostudy.eink.data.GrammarItem

sealed class ReferenceCardModel {
    data class Grammar(val item: GrammarItem) : ReferenceCardModel()
    data class Function(val item: FunctionItem) : ReferenceCardModel()
}

class ReferenceAdapter : RecyclerView.Adapter<ReferenceAdapter.ViewHolder>() {

    private var allItems: List<ReferenceCardModel> = emptyList()
    private var displayedItems: List<ReferenceCardModel> = emptyList()

    fun submitList(items: List<ReferenceCardModel>) {
        allItems = items
        displayedItems = items
        notifyDataSetChanged()
    }

    fun filter(query: String) {
        val q = query.trim().lowercase()
        displayedItems = if (q.isEmpty()) {
            allItems
        } else {
            allItems.filter { model ->
                when (model) {
                    is ReferenceCardModel.Grammar -> {
                        val g = model.item
                        g.title.lowercase().contains(q) ||
                        g.category.lowercase().contains(q) ||
                        g.summary.lowercase().contains(q) ||
                        g.syntax.lowercase().contains(q) ||
                        g.explanation.lowercase().contains(q) ||
                        g.pitfalls.lowercase().contains(q) ||
                        g.practice.lowercase().contains(q)
                    }
                    is ReferenceCardModel.Function -> {
                        val f = model.item
                        f.name.lowercase().contains(q) ||
                        f.module.lowercase().contains(q) ||
                        f.description.lowercase().contains(q) ||
                        f.signature.lowercase().contains(q)
                    }
                }
            }
        }
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_reference_card, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val model = displayedItems[position]
        when (model) {
            is ReferenceCardModel.Grammar -> {
                val g = model.item
                holder.tvTitle.text = g.title
                holder.tvBadge.text = g.category
                holder.tvSubtitle.text = g.syntax
                holder.tvDesc.text = g.summary
                holder.tvCode.text = g.example

                if (g.explanation.isNotBlank()) {
                    holder.layoutExplanation.visibility = View.VISIBLE
                    holder.tvExplanation.text = g.explanation
                } else {
                    holder.layoutExplanation.visibility = View.GONE
                }

                if (g.pitfalls.isNotBlank()) {
                    holder.layoutPitfalls.visibility = View.VISIBLE
                    holder.tvPitfalls.text = g.pitfalls
                } else {
                    holder.layoutPitfalls.visibility = View.GONE
                }

                if (g.practice.isNotBlank()) {
                    holder.layoutPractice.visibility = View.VISIBLE
                    holder.tvPractice.text = g.practice
                } else {
                    holder.layoutPractice.visibility = View.GONE
                }
            }
            is ReferenceCardModel.Function -> {
                val f = model.item
                holder.tvTitle.text = f.name
                holder.tvBadge.text = f.module
                holder.tvSubtitle.text = f.signature
                holder.tvDesc.text = f.description
                holder.tvCode.text = f.example

                holder.layoutExplanation.visibility = View.GONE
                holder.layoutPitfalls.visibility = View.GONE
                holder.layoutPractice.visibility = View.GONE
            }
        }
    }

    override fun getItemCount(): Int = displayedItems.size

    class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvTitle: TextView = itemView.findViewById(R.id.tv_item_title)
        val tvBadge: TextView = itemView.findViewById(R.id.tv_item_badge)
        val tvSubtitle: TextView = itemView.findViewById(R.id.tv_item_subtitle)
        val tvDesc: TextView = itemView.findViewById(R.id.tv_item_desc)
        val tvCode: TextView = itemView.findViewById(R.id.tv_item_code)

        val layoutExplanation: View = itemView.findViewById(R.id.layout_item_explanation)
        val tvExplanation: TextView = itemView.findViewById(R.id.tv_item_explanation)

        val layoutPitfalls: View = itemView.findViewById(R.id.layout_item_pitfalls)
        val tvPitfalls: TextView = itemView.findViewById(R.id.tv_item_pitfalls)

        val layoutPractice: View = itemView.findViewById(R.id.layout_item_practice)
        val tvPractice: TextView = itemView.findViewById(R.id.tv_item_practice)
    }
}
